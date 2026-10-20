// Backups of everything in the database: debates and votes, results,
// calendar entries, motions, messages, applications, ticket-alert sign-ups,
// sent emails and visitor stats.
//
// A backup is made automatically every night (see vercel.json) and kept in a
// private Vercel Blob store that only the website can read; the last 30
// (about a month) are kept. Admins can also make one, download one, or restore one from
// admin → Backups.
//
// Setup (once): in Vercel, open the project → Storage → Create → Blob, choose
// "Private", and connect it to this project. Vercel adds what's needed.
//
// Left out on purpose: short-lived things (login attempts, spam limits, the
// 30-minute visit records, live visitors, daily salts) and the daily
// unique-visitor counters, which can't be copied as text.
import { gzipSync, gunzipSync } from "node:zlib";
import { redis, pipeline } from "@/lib/store";

export const KEEP = 30;
const PREFIX = "backups/";
const SKIP = /^ku:(login|limit):|^ku:stats:(v|s|salt):|^ku:stats:live/;

export const blobConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
const blob = () => import("@vercel/blob");

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

async function allKeys() {
  const keys = [];
  let cursor = "0";
  do {
    const [next, batch] = await redis("SCAN", cursor, "MATCH", "ku:*", "COUNT", 1000);
    cursor = String(next);
    for (const key of batch || []) if (!SKIP.test(key)) keys.push(key);
  } while (cursor !== "0" && keys.length < 200000);
  return [...new Set(keys)].sort();
}

// Everything worth keeping, as one object.
export async function snapshot() {
  const keys = await allKeys();
  const out = [];
  for (let i = 0; i < keys.length; i += 200) {
    const chunk = keys.slice(i, i + 200);
    const types = await pipeline(chunk.map((key) => ["TYPE", key]));
    const reads = chunk.map((key, j) => {
      const type = String(types[j]);
      return {
        string: ["GET", key],
        hash: ["HGETALL", key],
        set: ["SMEMBERS", key],
        zset: ["ZRANGE", key, 0, -1, "WITHSCORES"],
        list: ["LRANGE", key, 0, -1],
      }[type];
    });
    const valid = chunk.map((key, j) => ({ key, type: String(types[j]), read: reads[j] })).filter((x) => x.read);
    const results = await pipeline(valid.flatMap((x) => [x.read, ["PTTL", x.key]]));
    valid.forEach((x, j) => {
      let value = results[j * 2];
      const ttl = Number(results[j * 2 + 1]);
      if (x.type === "hash") value = toMap(value);
      if (x.type === "zset") {
        const flat = Array.isArray(value?.[0]) ? value.flat() : value || [];
        value = [];
        for (let n = 0; n < flat.length; n += 2) value.push([flat[n], Number(flat[n + 1])]);
      }
      out.push({ key: x.key, type: x.type, ttl: ttl > 0 ? ttl : null, value });
    });
  }
  return { app: "kings-union", version: 1, createdAt: new Date().toISOString(), keys: out };
}

export const pack = (data) => gzipSync(Buffer.from(JSON.stringify(data)));

export function unpack(buffer) {
  const buf = Buffer.from(buffer);
  const text = buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf).toString("utf8") : buf.toString("utf8");
  const data = JSON.parse(text);
  if (data?.app !== "kings-union" || !Array.isArray(data.keys)) throw new Error("That isn’t a King’s Union backup file.");
  return data;
}

// e.g. kings-union-backup-2026-10-20-03-00-12-a1b2.json.gz (unique, so nothing is overwritten)
export const backupName = (date = new Date()) =>
  `kings-union-backup-${date.toISOString().slice(0, 19).replace(/[:T]/g, "-")}-${Math.random().toString(16).slice(2, 6).padEnd(4, "0")}.json.gz`;

// Puts every key in a backup back. Keys not in the backup are left alone.
export async function restore(data) {
  const cmds = [];
  let count = 0;
  for (const item of data.keys) {
    const { key, type, value, ttl } = item || {};
    if (typeof key !== "string" || !key.startsWith("ku:") || SKIP.test(key)) continue;
    cmds.push(["DEL", key]);
    if (type === "string" && value != null) cmds.push(["SET", key, String(value)]);
    else if (type === "hash" && value && typeof value === "object") {
      const pairs = Object.entries(value).flat().map(String);
      for (let i = 0; i < pairs.length; i += 1000) cmds.push(["HSET", key, ...pairs.slice(i, i + 1000)]);
    } else if (type === "set" && Array.isArray(value) && value.length) {
      for (let i = 0; i < value.length; i += 1000) cmds.push(["SADD", key, ...value.slice(i, i + 1000).map(String)]);
    } else if (type === "zset" && Array.isArray(value) && value.length) {
      const flat = value.flatMap(([m, s]) => [String(s), String(m)]);
      for (let i = 0; i < flat.length; i += 1000) cmds.push(["ZADD", key, ...flat.slice(i, i + 1000)]);
    } else if (type === "list" && Array.isArray(value) && value.length) {
      for (let i = 0; i < value.length; i += 1000) cmds.push(["RPUSH", key, ...value.slice(i, i + 1000).map(String)]);
    } else continue;
    if (ttl > 0) cmds.push(["PEXPIRE", key, Math.round(ttl)]);
    count += 1;
  }
  for (let i = 0; i < cmds.length; i += 500) await pipeline(cmds.slice(i, i + 500));
  return count;
}

// ---------- Stored backups (private Vercel Blob) ----------

export async function listBackups() {
  if (!blobConfigured()) return [];
  const { list } = await blob();
  const found = [];
  let cursor;
  do {
    const res = await list({ prefix: PREFIX, cursor, limit: 1000 });
    found.push(...res.blobs);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  return found
    .map((b) => ({ pathname: b.pathname, name: b.pathname.slice(PREFIX.length), size: b.size, uploadedAt: new Date(b.uploadedAt).getTime() }))
    .sort((a, b) => b.uploadedAt - a.uploadedAt || b.name.localeCompare(a.name));
}

export async function saveBackup() {
  if (!blobConfigured()) throw new Error("Backup storage isn’t set up yet.");
  const data = await snapshot();
  const body = pack(data);
  const { put, del } = await blob();
  const pathname = PREFIX + backupName();
  await put(pathname, body, { access: "private", contentType: "application/gzip", addRandomSuffix: false });
  // Keep the most recent ones only.
  // Keep the most recent ones only, and nothing older than about a month
  // (except the newest, so there is always one).
  const all = await listBackups();
  const cutoff = Date.now() - (KEEP + 1) * 864e5;
  const old = all.filter((b, i) => i > 0 && (i >= KEEP || b.uploadedAt < cutoff)).map((b) => b.pathname);
  if (old.length) await del(old);
  return { pathname, name: pathname.slice(PREFIX.length), size: body.length, keys: data.keys.length };
}

export async function readBackup(name) {
  if (!blobConfigured()) return null;
  if (!/^kings-union-backup-[\da-f-]+\.json\.gz$/.test(String(name || ""))) return null;
  const { get, head } = await blob();
  const info = await head(PREFIX + name).catch(() => null);
  if (!info) return null;
  const res = await get(info.url, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return Buffer.from(await new Response(res.stream).arrayBuffer());
}

// The committee organigram (admin → Organigram): who holds which role, who
// they report to, ranks, departments and custom lists. The page itself is
// public/organigram-app.html; it reads and writes through /api/admin/organigram.
//
// Everyone with an admin login can view it; the Executive (and super admins)
// can edit it. Nothing about the committee is kept in the code: the data only
// lives in the database (and so in the nightly backups).
//
// Key: ku:organigram  hash of "<collection>/<id>" -> JSON
//   people/<id>   one position: name, title, rank, dept, parent, order, email, notes…
//   ranks/<id>    name, color, level
//   fields/<id>   a custom dropdown list: name, options [{ id, label, color }]
//   settings/org  name, deptList, deptColors
import { redis } from "@/lib/store";

const KEY = "ku:organigram";
const MAX_DOCS = 1500;
const MAX_BYTES = 20000; // per record

const PATH = /^(?:(?:people|ranks|fields)\/[A-Za-z0-9_-]{1,64}|settings\/org)$/;

export const validPath = (path) => typeof path === "string" && PATH.test(path);

// Who may change it (viewing only needs the "organigram" section).
export const canEditOrganigram = (admin) => Boolean(admin?.teams?.some((t) => t === "executive" || t === "super"));

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

// Every record, as { "<collection>/<id>": data }.
export async function readOrganigram() {
  const raw = toMap(await redis("HGETALL", KEY));
  const docs = {};
  for (const [path, json] of Object.entries(raw)) {
    if (!validPath(path)) continue;
    try {
      docs[path] = JSON.parse(json);
    } catch {
      // skip a damaged record rather than break the page
    }
  }
  return docs;
}

export async function readRecord(path) {
  if (!validPath(path)) return null;
  const json = await redis("HGET", KEY, path);
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export class TooBig extends Error {}

export async function saveRecord(path, data) {
  if (!validPath(path)) throw new Error("That isn’t part of the organigram.");
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Nothing to save.");
  const { id: _drop, ...rest } = data;
  const json = JSON.stringify(rest);
  if (json.length > MAX_BYTES) throw new TooBig("That position has too much text. Shorten its notes.");
  const exists = await redis("HEXISTS", KEY, path);
  if (!Number(exists) && Number(await redis("HLEN", KEY)) >= MAX_DOCS) throw new TooBig("The organigram is full. Delete some positions first.");
  await redis("HSET", KEY, path, json);
}

export async function deleteRecord(path) {
  if (!validPath(path)) throw new Error("That isn’t part of the organigram.");
  await redis("HDEL", KEY, path);
}

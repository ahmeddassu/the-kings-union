// Tiny client for the voting database.
//
// Works with either kind of Redis database Vercel can connect:
//  - "Redis" (Redis Cloud): Vercel adds REDIS_URL. Used over a normal connection.
//  - "Upstash for Redis": Vercel adds KV_REST_API_URL and KV_REST_API_TOKEN
//    (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Used over HTTPS.
// Nothing else is needed.

import { unstable_cache } from "next/cache";

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || "";

const useRest = Boolean(REST_URL && REST_TOKEN);
export const storeConfigured = useRest || Boolean(REDIS_URL);

export class StoreError extends Error {}

const notConnected = () => new StoreError("The voting database isn't connected yet.");

// ---------- Upstash (HTTPS) ----------

async function restCall(path, body) {
  const res = await fetch(REST_URL.replace(/\/$/, "") + path, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data == null) throw new StoreError(`Database error (${res.status})`);
  return data;
}

// ---------- Redis (normal connection) ----------

// One shared connection per server instance, opened on first use and reopened
// if it drops.
let clientPromise = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import("redis");
      const client = createClient({
        url: REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 200, 2000)),
        },
      });
      client.on("error", () => {}); // reported through the failing command instead
      client.on("end", () => {
        clientPromise = null;
      });
      await client.connect();
      // Don't let an idle connection keep a build or script running.
      client.unref?.();
      return client;
    })().catch((err) => {
      clientPromise = null;
      throw new StoreError(`Couldn't reach the database (${err.message})`);
    });
  }
  return clientPromise;
}

// node-redis wants every argument as a string.
const asArgs = (command) => command.map((x) => String(x));

async function tcpCommand(command) {
  const client = await getClient();
  try {
    return await client.sendCommand(asArgs(command));
  } catch (err) {
    throw new StoreError(err.message || "Database error");
  }
}

// ---------- Shared interface ----------

// One command, e.g. redis("GET", "key"). Returns the result.
export async function redis(...command) {
  if (!storeConfigured) throw notConnected();
  if (!useRest) return tcpCommand(command);
  const data = await restCall("", command);
  if (data.error) throw new StoreError(data.error);
  return data.result;
}

// Several commands in one round trip. Returns their results in order.
export async function pipeline(commands) {
  if (!commands.length) return [];
  if (!storeConfigured) throw notConnected();
  if (!useRest) {
    const client = await getClient();
    const multi = client.multi();
    for (const c of commands) multi.addCommand(asArgs(c));
    try {
      return await multi.exec();
    } catch (err) {
      throw new StoreError(err.message || "Database error");
    }
  }
  const data = await restCall("/pipeline", commands);
  return data.map((r) => {
    if (r.error) throw new StoreError(r.error);
    return r.result;
  });
}

// A single read that Next.js may cache for `seconds` (used by the public website,
// so it never slows pages down). Returns null on any problem.
export async function cachedGet(key, seconds = 60) {
  if (!storeConfigured) return null;
  if (useRest) {
    try {
      const res = await fetch(`${REST_URL.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${REST_TOKEN}` },
        next: { revalidate: seconds },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.result ?? null;
    } catch {
      return null;
    }
  }
  try {
    const read = unstable_cache(async () => tcpCommand(["GET", key]), ["ku-store", key], { revalidate: seconds });
    return (await read()) ?? null;
  } catch {
    return null;
  }
}

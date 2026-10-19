// Tiny client for the voting database (Upstash Redis, connected through Vercel).
//
// SETUP: in Vercel, open the project → Storage → Create Database → "Upstash for
// Redis" (free) → connect it to this project. Vercel then adds the settings
// KV_REST_API_URL and KV_REST_API_TOKEN automatically. Nothing else is needed.
// (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN also work.)

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const storeConfigured = Boolean(URL_ && TOKEN);

export class StoreError extends Error {}

async function call(path, body) {
  if (!storeConfigured) throw new StoreError("The voting database isn't connected yet.");
  const res = await fetch(URL_.replace(/\/$/, "") + path, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data == null) throw new StoreError(`Database error (${res.status})`);
  return data;
}

// One command, e.g. redis("GET", "key"). Returns the result.
export async function redis(...command) {
  const data = await call("", command);
  if (data.error) throw new StoreError(data.error);
  return data.result;
}

// Several commands in one round trip. Returns their results in order.
export async function pipeline(commands) {
  if (!commands.length) return [];
  const data = await call("/pipeline", commands);
  return data.map((r) => {
    if (r.error) throw new StoreError(r.error);
    return r.result;
  });
}

// A single read that Next.js may cache for `seconds` (used by the public website,
// so it never slows pages down). Returns null on any problem.
export async function cachedGet(key, seconds = 60) {
  if (!storeConfigured) return null;
  try {
    const res = await fetch(`${URL_.replace(/\/$/, "")}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: seconds },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result ?? null;
  } catch {
    return null;
  }
}

// Visitor stats, counted on our own database. Privacy-friendly by design:
// no cookies, nothing stored about individuals. A visitor is recognised only
// within one day, by a one-way hash of (day, IP address, browser, secret), so
// people can't be followed from one day to the next.
//
// Keys (one set per London day, kept ~13 months):
//   ku:stats:v:<day>     HyperLogLog of visitor hashes (unique visitors)
//   ku:stats:pv:<day>    hash page -> views
//   ku:stats:ref:<day>   hash website -> visits arriving from it
//   ku:stats:dev:<day>   hash "mobile" | "desktop" -> views
//   ku:stats:geo:<day>   hash country code -> views
import { createHash } from "node:crypto";
import { pipeline } from "@/lib/store";

const KEEP_SECONDS = 400 * 24 * 3600;
const MAX_PAGES_PER_DAY = 1000;
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|node-fetch|axios|go-http/i;

export const londonDay = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });

const k = {
  v: (d) => `ku:stats:v:${d}`,
  pv: (d) => `ku:stats:pv:${d}`,
  ref: (d) => `ku:stats:ref:${d}`,
  dev: (d) => `ku:stats:dev:${d}`,
  geo: (d) => `ku:stats:geo:${d}`,
};

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.REDIS_URL || process.env.KV_REST_API_TOKEN || "kings-union";
}

// Only plain site paths are counted, e.g. /events/abolish-private-schools.
export function cleanPath(raw) {
  const path = String(raw || "").split(/[?#]/)[0].toLowerCase();
  if (!/^\/[a-z0-9\-/]{0,120}$/.test(path)) return null;
  if (/^\/(admin|vote|api|_next)(\/|$)/.test(path)) return null;
  return path.length > 1 ? path.replace(/\/+$/, "") : "/";
}

function referrerHost(ref, ownHost) {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (!host || host === ownHost.replace(/^www\./, "") || host.endsWith("kingsunion.org.uk") || host === "localhost") return null;
    return host.slice(0, 80);
  } catch {
    return null;
  }
}

export async function recordView({ path, referrer, ip, userAgent, country, host }) {
  const page = cleanPath(path);
  if (!page || !userAgent || BOTS.test(userAgent)) return false;
  const day = londonDay();
  const visitor = createHash("sha256").update(`${day}|${ip}|${userAgent}|${secret()}`).digest("hex").slice(0, 20);
  const device = /mobile|iphone|android|ipad|tablet/i.test(userAgent) ? "mobile" : "desktop";
  const from = referrerHost(referrer, host || "");
  const cc = /^[A-Z]{2}$/.test(country || "") ? country : null;

  const cmds = [
    ["PFADD", k.v(day), visitor],
    ["HINCRBY", k.pv(day), page, 1],
    ["HINCRBY", k.dev(day), device, 1],
  ];
  if (from) cmds.push(["HINCRBY", k.ref(day), from, 1]);
  if (cc) cmds.push(["HINCRBY", k.geo(day), cc, 1]);
  for (const key of [k.v(day), k.pv(day), k.dev(day), k.ref(day), k.geo(day)]) cmds.push(["EXPIRE", key, KEEP_SECONDS]);
  cmds.push(["HLEN", k.pv(day)]);
  const res = await pipeline(cmds);
  // Guard against junk paths filling the day's list.
  if (Number(res[res.length - 1]) > MAX_PAGES_PER_DAY) await pipeline([["HDEL", k.pv(day), page]]);
  return true;
}

// HGETALL comes back as an object (Redis) or a flat list (Upstash).
function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return Object.fromEntries(Object.entries(reply).map(([a, b]) => [a, Number(b)]));
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = Number(reply[i + 1]);
  return out;
}

const addInto = (total, map) => {
  for (const [key, n] of Object.entries(map)) total[key] = (total[key] || 0) + n;
  return total;
};
const top = (map, n) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));

export async function getStats(days = 30) {
  const list = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) list.push(londonDay(new Date(now - i * 864e5)));
  const cmds = list.flatMap((d) => [["PFCOUNT", k.v(d)], ["HGETALL", k.pv(d)], ["HGETALL", k.ref(d)], ["HGETALL", k.dev(d)], ["HGETALL", k.geo(d)]]);
  const last7 = list.slice(-7).map(k.v);
  cmds.push(["PFCOUNT", ...last7], ["PFCOUNT", ...list.map(k.v)]);
  const res = await pipeline(cmds);

  const daily = [];
  const pages = {}, refs = {}, devices = {}, countries = {};
  list.forEach((day, i) => {
    const [vis, pv, ref, dev, geo] = res.slice(i * 5, i * 5 + 5);
    const pvMap = toMap(pv);
    const views = Object.values(pvMap).reduce((a, b) => a + b, 0);
    daily.push({ day, visitors: Number(vis) || 0, views });
    addInto(pages, pvMap);
    addInto(refs, toMap(ref));
    addInto(devices, toMap(dev));
    addInto(countries, toMap(geo));
  });
  const [week, month] = res.slice(-2).map(Number);

  return {
    days,
    daily,
    today: daily[daily.length - 1],
    visitors7: week || 0,
    visitors: month || 0,
    views: daily.reduce((a, d) => a + d.views, 0),
    pages: top(pages, 15),
    referrers: top(refs, 10),
    devices: { mobile: devices.mobile || 0, desktop: devices.desktop || 0 },
    countries: top(countries, 8),
  };
}

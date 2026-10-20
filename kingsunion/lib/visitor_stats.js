// Visitor stats, counted on our own database and designed to stay within UK
// GDPR and PECR without a cookie banner:
//  - Nothing is stored on visitors' devices (no cookies, no local storage),
//    except a "don't count me" flag for people who opt out on /privacy.
//  - IP addresses are never stored. A visitor is recognised only within one
//    day by a one-way hash of (IP, browser, a random salt that changes daily).
//    Each salt is deleted after two days, so the hashes can't be reversed or
//    linked across days, and nobody can be followed over time.
//  - Everything else is stored only as totals (page X had N views), never as
//    a record of what one person did. Referrers are reduced to the website
//    name, places to city level, browsers to their name.
//  - To group pages into visits, that daily code is kept for 30 minutes after
//    someone's last page (with the page count and time on screen), then
//    turned into totals and deleted.
//  - Kept for 13 months, not shared with anyone. Explained on /privacy.
//
// Keys:
//   ku:stats:d:<day>     hash "dimension|value" -> count (all daily totals)
//   ku:stats:v:<day>     HyperLogLog of the day's visitor hashes
//   ku:stats:salt:<day>  that day's random salt (deleted after 2 days)
//   ku:stats:live        sorted set visitor hash -> last seen (kept 30 minutes)
//   ku:stats:livepage    hash visitor hash -> page they're on (kept 30 minutes)
//   ku:stats:s:<hash>    the current visit: start, pages, seconds on screen
// Older keys from the first version (pv/ref/dev/geo) are still read.
import { createHash, randomBytes } from "node:crypto";
import { pipeline, redis } from "@/lib/store";

const KEEP_SECONDS = 400 * 24 * 3600;
const MAX_FIELDS_PER_DAY = 6000;
const LIVE_WINDOW = 5 * 60 * 1000; // "on the site now"
const VISIT_GAP = 30 * 60 * 1000; // a visit ends after 30 minutes without a page
export const MIN_CITY_COUNT = 3; // smaller groups aren't shown, so no one stands out

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|node-fetch|axios|go-http|scrapy|httpclient|java\//i;

export const londonDay = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const londonHour = (d = new Date()) => Number(d.toLocaleString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false })) % 24;

const k = {
  d: (day) => `ku:stats:d:${day}`,
  v: (day) => `ku:stats:v:${day}`,
  salt: (day) => `ku:stats:salt:${day}`,
  live: "ku:stats:live",
  livePage: "ku:stats:livepage",
  visit: (hash) => `ku:stats:s:${hash}`,
  // first version
  pv: (day) => `ku:stats:pv:${day}`,
  ref: (day) => `ku:stats:ref:${day}`,
  dev: (day) => `ku:stats:dev:${day}`,
  geo: (day) => `ku:stats:geo:${day}`,
};

// ---------- Cleaning what comes in ----------

// Only plain site paths are counted, e.g. /events/abolish-private-schools.
export function cleanPath(raw) {
  const path = String(raw || "").split(/[?#]/)[0].toLowerCase();
  if (!/^\/[a-z0-9\-/]{0,120}$/.test(path)) return null;
  if (/^\/(admin|vote|api|_next)(\/|$)/.test(path)) return null;
  return path.length > 1 ? path.replace(/\/+$/, "") : "/";
}

const safe = (v, max = 60) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9 ._\-:/]/g, "")
    .replace(/\|/g, "")
    .trim()
    .slice(0, max);

function referrerHost(ref, ownHost) {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === ownHost.replace(/^www\./, "") || host.endsWith("kingsunion.org.uk") || host === "localhost") return null;
    return host.slice(0, 80);
  } catch {
    return null;
  }
}

const SOCIAL = /(^|\.)(instagram|facebook|fb|t|x|twitter|linkedin|lnkd|tiktok|reddit|youtube|threads|snapchat|whatsapp|linktr)\.(com|co|ee|net|me|in)$|^l\.instagram\.com$|^lm\.facebook\.com$/;
const SEARCH = /(^|\.)(google|bing|duckduckgo|ecosia|yahoo|brave|startpage|qwant|baidu|yandex|perplexity|chatgpt|openai|claude)\./;
const EMAIL = /mail\.|outlook\.(live|office)|webmail/;

const socialName = (host) =>
  (
    { "t.co": "x.com", "twitter.com": "x.com", "lnkd.in": "linkedin.com", "l.instagram.com": "instagram.com", "lm.facebook.com": "facebook.com", "m.facebook.com": "facebook.com", "fb.com": "facebook.com" }[host] || host
  );

function channelFor({ from, utm }) {
  const medium = utm?.medium || "";
  if (/qr|poster|print|flyer/.test(medium)) return "QR codes and posters";
  if (/email|newsletter/.test(medium)) return "Email";
  if (/social|instagram|story|bio/.test(medium) || /instagram|facebook|tiktok|linkedin|x|twitter/.test(utm?.source || "")) return "Social media";
  if (utm?.source) return "Campaign links";
  if (!from) return "Direct (typed, bookmarks, apps)";
  if (SOCIAL.test(from)) return "Social media";
  if (SEARCH.test(from)) return "Search engines";
  if (EMAIL.test(from)) return "Email";
  if (/kcl\.ac\.uk$|kclsu\.org$/.test(from)) return "King’s and KCLSU sites";
  return "Other websites";
}

// Browser and system names only, never the full browser string.
export function describeAgent(ua) {
  const s = String(ua || "");
  let browser = "Other";
  if (/Instagram/i.test(s)) browser = "Instagram app";
  else if (/FBAN|FBAV|FB_IAB/i.test(s)) browser = "Facebook app";
  else if (/musical_ly|TikTok|BytedanceWebview/i.test(s)) browser = "TikTok app";
  else if (/LinkedInApp/i.test(s)) browser = "LinkedIn app";
  else if (/Snapchat/i.test(s)) browser = "Snapchat app";
  else if (/Edg(e|A|iOS)?\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Firefox|FxiOS/.test(s)) browser = "Firefox";
  else if (/Chrome|CriOS/.test(s)) browser = "Chrome";
  else if (/Safari/.test(s)) browser = "Safari";

  let os = "Other";
  if (/iPad/.test(s)) os = "iPadOS";
  else if (/iPhone|iPod/.test(s)) os = "iOS";
  else if (/Android/.test(s)) os = "Android";
  else if (/CrOS/.test(s)) os = "ChromeOS";
  else if (/Windows/.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/Linux/.test(s)) os = "Linux";

  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(s) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(s) ? "phone" : "desktop";
  return { browser, os, device };
}

function sizeBucket(w) {
  const n = Number(w);
  if (!Number.isFinite(n) || n <= 0 || n > 10000) return null;
  if (n < 640) return "Phone (under 640px)";
  if (n < 1024) return "Tablet or small window (640–1023px)";
  if (n < 1440) return "Laptop (1024–1439px)";
  return "Large screen (1440px and up)";
}

const DURATIONS = [
  [10, "Under 10 seconds"],
  [30, "10–30 seconds"],
  [60, "30–60 seconds"],
  [180, "1–3 minutes"],
  [600, "3–10 minutes"],
  [Infinity, "Over 10 minutes"],
];
export const DURATION_LABELS = DURATIONS.map((d) => d[1]);
const durationBucket = (secs) => DURATIONS.find(([max]) => secs < max)[1];

export const DEPTH_LABELS = ["1 page", "2 pages", "3–4 pages", "5–9 pages", "10+ pages"];
const depthBucket = (n) => (n <= 1 ? DEPTH_LABELS[0] : n === 2 ? DEPTH_LABELS[1] : n <= 4 ? DEPTH_LABELS[2] : n <= 9 ? DEPTH_LABELS[3] : DEPTH_LABELS[4]);

// What a click was, from a short label the browser sends.
function cleanEventLabel(raw) {
  const s = String(raw || "").replace(/[\r\n|]/g, " ").trim().slice(0, 80);
  if (!/^(Calendar|Tickets|Link|Email link|Phone link|Form|Vote banner|Join|Share|Download|Subscribe)\b/.test(s)) return null;
  return s;
}

// ---------- Recording ----------

async function daySalt(day) {
  const key = k.salt(day);
  const fresh = randomBytes(16).toString("hex");
  const [, salt] = await pipeline([
    ["SET", key, fresh, "NX", "EX", 2 * 24 * 3600],
    ["GET", key],
  ]);
  return salt || fresh;
}

const visitorHash = (day, salt, ip, ua) => createHash("sha256").update(`${day}|${salt}|${ip}|${ua}`).digest("hex").slice(0, 20);

const inc = (day, field, by = 1) => ["HINCRBY", k.d(day), field, Math.round(by)];

// One hit from the browser. `hit.type` is view | leave | end | ping | event | notfound.
export async function recordHit(hit, { ip, userAgent, country, region, city, language, host }) {
  if (!userAgent || BOTS.test(userAgent)) return false;
  const now = new Date();
  const day = londonDay(now);
  const type = hit.type || "view";
  const page = cleanPath(hit.path);
  if (type !== "notfound" && !page) return false;
  if (type === "notfound") {
    const bad = String(hit.path || "").split(/[?#]/)[0].toLowerCase().replace(/[^a-z0-9\-/._]/g, "").slice(0, 100);
    if (!bad) return false;
    await finish(day, [inc(day, `nf|${bad}`)]);
    return true;
  }

  const salt = await daySalt(day);
  const visitor = visitorHash(day, salt, ip, userAgent);
  const cmds = [];
  const liveCmds = [
    ["ZADD", k.live, now.getTime(), visitor],
    ["HSET", k.livePage, visitor, page],
  ];

  if (type === "view") {
    const { browser, os, device } = describeAgent(userAgent);
    const vk = k.visit(visitor);
    const [pagesSoFar] = await pipeline([
      ["HINCRBY", vk, "pages", 1],
      ["HSETNX", vk, "start", now.getTime()],
      ["HSETNX", vk, "day", day],
      ["PEXPIRE", vk, VISIT_GAP * 2],
    ]);
    hit.entry = Number(pagesSoFar) === 1;
    cmds.push(["PFADD", k.v(day), visitor], ["EXPIRE", k.v(day), KEEP_SECONDS]);
    cmds.push(inc(day, `pv|${page}`), inc(day, "total|views"), inc(day, `hour|${londonHour(now)}`), inc(day, `dev|${device}`));
    if (hit.entry) {
      // First page of a visit: where they came from and what device they're on.
      const from = referrerHost(hit.referrer, host || "");
      const utm = hit.utm && typeof hit.utm === "object" ? { source: safe(hit.utm.source, 40), medium: safe(hit.utm.medium, 40), campaign: safe(hit.utm.campaign, 60) } : null;
      cmds.push(inc(day, "total|visits"), inc(day, `entry|${page}`), inc(day, `chan|${channelFor({ from, utm })}`));
      if (from) cmds.push(inc(day, `ref|${SOCIAL.test(from) ? socialName(from) : from}`));
      if (utm?.source) cmds.push(inc(day, `utm|${[utm.source, utm.medium, utm.campaign].filter(Boolean).join(" / ")}`));
      cmds.push(inc(day, `br|${browser}`), inc(day, `os|${os}`), inc(day, `vdev|${device}`));
      const size = sizeBucket(hit.width);
      if (size) cmds.push(inc(day, `size|${size}`));
      if (/^[A-Z]{2}$/.test(country || "")) {
        cmds.push(inc(day, `geo|${country}`));
        const place = decodeCity(city);
        if (place) cmds.push(inc(day, `city|${place}, ${country}`));
        if (country === "GB" && /^[A-Z]{3}$/.test(region || "")) cmds.push(inc(day, `region|${region}`));
      }
      const lang = /^[a-z]{2,3}/i.exec(language || "")?.[0]?.toLowerCase();
      if (lang) cmds.push(inc(day, `lang|${lang}`));
    }
  } else if (type === "leave") {
    // Time actually spent looking at a page (tab visible), and how far down they read.
    const secs = Math.min(Math.max(Number(hit.secs) || 0, 0), 3600);
    const scroll = Math.min(Math.max(Number(hit.scroll) || 0, 0), 100);
    cmds.push(inc(day, `time|${page}`, secs), ["HINCRBY", k.visit(visitor), "secs", Math.round(secs)]);
    if (!hit.more) {
      cmds.push(inc(day, `timen|${page}`), inc(day, `scroll|${page}`, scroll));
      if (scroll >= 90) cmds.push(inc(day, `read|${page}`));
    }
  } else if (type === "event") {
    const label = cleanEventLabel(hit.label);
    if (!label) return false;
    cmds.push(inc(day, `evt|${label}`), inc(day, `pevt|${page}|${label.split(":")[0]}`));
  } else if (type !== "ping") {
    return false;
  }

  await finish(day, cmds, liveCmds);
  if (Math.random() < 0.05) await closeVisits();
  return true;
}

function decodeCity(raw) {
  if (!raw) return null;
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    // keep as is
  }
  s = s.replace(/[^\p{L}\p{M} .'\-]/gu, "").trim().slice(0, 50);
  return s || null;
}

async function finish(day, cmds, extra = []) {
  if (!cmds.length && !extra.length) return;
  const all = [...cmds, ...extra, ["EXPIRE", k.d(day), KEEP_SECONDS], ["HLEN", k.d(day)]];
  const res = await pipeline(all);
  // Guard against junk filling a day: drop brand-new fields once the day is full.
  if (Number(res[res.length - 1]) > MAX_FIELDS_PER_DAY) {
    const drop = cmds.filter((c, i) => c[0] === "HINCRBY" && Number(res[i]) === Number(c[3]) && !c[2].startsWith("total|")).map((c) => c[2]);
    if (drop.length) await redis("HDEL", k.d(day), ...drop);
  }
}

// Visits with no page for 30 minutes are over: add their length and number of
// pages to that day's totals, then delete everything about them.
export async function closeVisits() {
  const old = ((await redis("ZRANGEBYSCORE", k.live, 0, Date.now() - VISIT_GAP)) || []).slice(0, 500);
  if (!old.length) return;
  const claimed = await pipeline(old.map((id) => ["ZREM", k.live, id]));
  const mine = old.filter((_, i) => Number(claimed[i]) === 1); // each visit is closed once
  if (!mine.length) return;
  const visits = await pipeline(mine.map((id) => ["HMGET", k.visit(id), "pages", "secs", "day"]));
  const cmds = [["HDEL", k.livePage, ...mine], ...mine.map((id) => ["DEL", k.visit(id)])];
  const days = new Set();
  visits.forEach((v) => {
    const [pagesRaw, secsRaw, day] = v || [];
    const pages = Number(pagesRaw) || 0;
    if (!pages || !/^\d{4}-\d{2}-\d{2}$/.test(day || "")) return;
    const secs = Math.min(Number(secsRaw) || 0, 4 * 3600);
    days.add(day);
    cmds.push(inc(day, "total|ended"), inc(day, "total|visitsecs", secs), inc(day, `dur|${durationBucket(secs)}`), inc(day, `depth|${depthBucket(pages)}`));
  });
  for (const day of days) cmds.push(["EXPIRE", k.d(day), KEEP_SECONDS]);
  await pipeline(cmds);
}

// ---------- Reading ----------

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return Object.fromEntries(Object.entries(reply).map(([a, b]) => [a, Number(b)]));
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = Number(reply[i + 1]);
  return out;
}

const top = (map, n = 15) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));

const dayList = (days, endOffset = 0) => {
  const list = [];
  const now = Date.now();
  for (let i = days - 1 + endOffset; i >= endOffset; i--) list.push(londonDay(new Date(now - i * 864e5)));
  return list;
};

// Who's on the site in the last five minutes, and on which pages.
export async function getLive() {
  await closeVisits();
  const ids = (await redis("ZRANGEBYSCORE", k.live, Date.now() - LIVE_WINDOW, "+inf")) || [];
  if (!ids.length) return { count: 0, pages: [] };
  const paths = (await redis("HMGET", k.livePage, ...ids)) || [];
  const pages = {};
  for (const p of paths) if (p) pages[p] = (pages[p] || 0) + 1;
  return { count: ids.length, pages: top(pages, 10) };
}

export async function getStats(days = 30) {
  await closeVisits().catch(() => {});
  const list = dayList(days);
  const prev = dayList(days, days);
  const cmds = list.flatMap((d) => [["PFCOUNT", k.v(d)], ["HGETALL", k.d(d)], ["HGETALL", k.pv(d)], ["HGETALL", k.ref(d)], ["HGETALL", k.dev(d)], ["HGETALL", k.geo(d)]]);
  cmds.push(["PFCOUNT", ...list.map(k.v)], ["PFCOUNT", ...list.slice(-7).map(k.v)], ["PFCOUNT", ...prev.map(k.v)]);
  cmds.push(...prev.map((d) => ["HMGET", k.d(d), "total|views", "total|visits", "total|ended", "total|visitsecs", `depth|${DEPTH_LABELS[0]}`]));
  cmds.push(...prev.map((d) => ["HGETALL", k.pv(d)]));
  const res = await pipeline(cmds);

  const dims = {}; // dimension -> { value -> count }
  const add = (dim, key, n) => {
    const m = (dims[dim] ||= {});
    m[key] = (m[key] || 0) + n;
  };
  const daily = [];
  const heat = Array.from({ length: 7 }, () => Array(24).fill(0)); // weekday (Mon=0) x hour

  list.forEach((day, i) => {
    const [vis, d, oldPv, oldRef, oldDev, oldGeo] = res.slice(i * 6, i * 6 + 6);
    const map = toMap(d);
    let views = 0;
    for (const [field, n] of Object.entries(map)) {
      const bar = field.indexOf("|");
      const dim = field.slice(0, bar);
      const key = field.slice(bar + 1);
      add(dim, key, n);
      if (dim === "pv") views += n;
      if (dim === "hour") {
        const [y, m, dd] = day.split("-").map(Number);
        const wd = (new Date(Date.UTC(y, m - 1, dd)).getUTCDay() + 6) % 7;
        heat[wd][Number(key)] += n;
      }
    }
    // First-version data (before the fuller stats)
    for (const [p, n] of Object.entries(toMap(oldPv))) (add("pv", p, n), (views += n), add("total", "views", n));
    for (const [r, n] of Object.entries(toMap(oldRef))) add("ref", r, n);
    for (const [dv, n] of Object.entries(toMap(oldDev))) add("dev", dv === "mobile" ? "phone" : dv, n);
    for (const [c, n] of Object.entries(toMap(oldGeo))) add("geo", c, n);
    daily.push({ day, visitors: Number(vis) || 0, views, visits: map["total|visits"] || 0 });
  });

  const n = list.length * 6;
  const [visitors, visitors7, prevVisitors] = res.slice(n, n + 3).map((x) => Number(x) || 0);
  const prevTotals = { views: 0, visits: 0, ended: 0, visitsecs: 0, bounces: 0 };
  res.slice(n + 3, n + 3 + prev.length).forEach((row) => {
    const [v, vi, e, s, b] = (row || []).map((x) => Number(x) || 0);
    prevTotals.views += v;
    prevTotals.visits += vi;
    prevTotals.ended += e;
    prevTotals.visitsecs += s;
    prevTotals.bounces += b;
  });
  res.slice(n + 3 + prev.length).forEach((row) => {
    for (const x of Object.values(toMap(row))) prevTotals.views += x;
  });

  const t = dims.total || {};
  const views = daily.reduce((a, d) => a + d.views, 0);
  const visits = t.visits || 0;
  const ended = t.ended || 0;
  const bounces = (dims.depth || {})[DEPTH_LABELS[0]] || 0;

  // Per-page detail: views, average time, how many read to the end, entries, clicks.
  const pages = Object.entries(dims.pv || {})
    .map(([path, v]) => {
      const samples = dims.timen?.[path] || 0;
      return {
        path,
        views: v,
        entries: dims.entry?.[path] || 0,
        avgSecs: samples ? Math.round((dims.time?.[path] || 0) / samples) : null,
        avgScroll: samples ? Math.round((dims.scroll?.[path] || 0) / samples) : null,
        readPct: samples ? Math.round(((dims.read?.[path] || 0) / samples) * 100) : null,
        tickets: dims.pevt?.[`${path}|Tickets`] || 0,
        calendar: dims.pevt?.[`${path}|Calendar`] || 0,
      };
    })
    .sort((a, b) => b.views - a.views);

  const cities = top(dims.city || {}, 40).filter((c) => c.count >= MIN_CITY_COUNT).slice(0, 12);

  return {
    days,
    daily,
    heat,
    hours: Array.from({ length: 24 }, (_, h) => (dims.hour || {})[h] || 0),
    today: daily[daily.length - 1],
    visitors,
    visitors7,
    views,
    visits,
    pagesPerVisit: visits ? views / visits : null,
    avgVisitSecs: ended ? Math.round((t.visitsecs || 0) / ended) : null,
    bounceRate: ended ? bounces / ended : null,
    previous: {
      visitors: prevVisitors,
      views: prevTotals.views,
      visits: prevTotals.visits,
      pagesPerVisit: prevTotals.visits ? prevTotals.views / prevTotals.visits : null,
      avgVisitSecs: prevTotals.ended ? Math.round(prevTotals.visitsecs / prevTotals.ended) : null,
      bounceRate: prevTotals.ended ? prevTotals.bounces / prevTotals.ended : null,
    },
    pages,
    entries: top(dims.entry || {}, 10),
    channels: top(dims.chan || {}, 10),
    referrers: top(dims.ref || {}, 15),
    campaigns: top(dims.utm || {}, 15),
    events: top(dims.evt || {}, 20),
    notFound: top(dims.nf || {}, 10),
    devices: dims.dev || {},
    visitDevices: dims.vdev || {},
    sizes: top(dims.size || {}, 4),
    browsers: top(dims.br || {}, 10),
    systems: top(dims.os || {}, 8),
    countries: top(dims.geo || {}, 12),
    regions: top(dims.region || {}, 8),
    cities,
    languages: top(dims.lang || {}, 8),
    durations: DURATION_LABELS.map((key) => ({ key, count: (dims.dur || {})[key] || 0 })),
    depths: DEPTH_LABELS.map((key) => ({ key, count: (dims.depth || {})[key] || 0 })),
  };
}

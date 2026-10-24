// Phone and browser notifications ("web push") for admin notifications.
//
// Each person turns them on per device, from the bell in the admin header. On
// iPhones, admin must first be added to the home screen (Share → Add to Home
// Screen; iOS 16.4 or later). After that, every notification in admin
// (lib/notifications.js) also pops up on their devices.
//
// The keys that sign notifications are made automatically the first time
// they're needed and kept in the database. To use your own instead, set
// VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel.
//
// Keys:
//   ku:push-vapid          JSON { publicKey, privateKey }
//   ku:push:<admin id>     hash: device id → JSON subscription { endpoint, keys, ua, at }
import { createHash } from "node:crypto";
import webpush from "web-push";
import { redis, pipeline } from "@/lib/store";

const VAPID = "ku:push-vapid";
const subsKey = (id) => `ku:push:${id}`;
const MAX_DEVICES = 10;
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));

let keys = null;
async function vapid() {
  if (keys) return keys;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    keys = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
    return keys;
  }
  const saved = await redis("GET", VAPID);
  if (saved) return (keys = JSON.parse(saved));
  const made = webpush.generateVAPIDKeys();
  // NX: if two requests race, both use whichever was saved first.
  await redis("SET", VAPID, JSON.stringify(made), "NX");
  return (keys = JSON.parse(await redis("GET", VAPID)));
}

export async function publicKey() {
  return (await vapid()).publicKey;
}

const deviceId = (endpoint) => createHash("sha256").update(endpoint).digest("hex").slice(0, 16);

function checkedSubscription(sub) {
  const endpoint = String(sub?.endpoint || "");
  if (!/^https:\/\/[^\s]{10,800}$/.test(endpoint)) throw new Error("That device can’t receive notifications.");
  const p256dh = String(sub?.keys?.p256dh || "");
  const auth = String(sub?.keys?.auth || "");
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(p256dh) || !/^[A-Za-z0-9_-]{8,100}$/.test(auth)) throw new Error("That device can’t receive notifications.");
  return { endpoint, keys: { p256dh, auth } };
}

export async function addDevice(admin, sub, ua = "") {
  if (!isId(admin?.id)) throw new Error("Sign in with your own login to turn on notifications.");
  const clean = checkedSubscription(sub);
  const id = deviceId(clean.endpoint);
  const count = Number(await redis("HLEN", subsKey(admin.id)));
  if (count >= MAX_DEVICES && !Number(await redis("HEXISTS", subsKey(admin.id), id))) throw new Error("You have notifications on too many devices. Turn some off first.");
  await redis("HSET", subsKey(admin.id), id, JSON.stringify({ ...clean, ua: String(ua).slice(0, 120), at: Date.now() }));
  return id;
}

export async function removeDevice(admin, endpoint) {
  if (!isId(admin?.id) || !endpoint) return;
  await redis("HDEL", subsKey(admin.id), deviceId(String(endpoint)));
}

export async function deviceCount(admin) {
  if (!isId(admin?.id)) return 0;
  return Number(await redis("HLEN", subsKey(admin.id)));
}

// Sends one notification to every device of each person. Devices that have
// been switched off or uninstalled are forgotten. Never throws.
export async function pushTo(adminIds, { title, body, href = "" }) {
  try {
    const ids = [...new Set(adminIds)].filter(isId);
    if (!ids.length) return 0;
    const lists = await pipeline(ids.map((id) => ["HGETALL", subsKey(id)]));
    const targets = [];
    ids.forEach((id, i) => {
      const reply = lists[i] || {};
      const entries = Array.isArray(reply) ? reply.reduce((acc, v, j, arr) => (j % 2 ? acc : [...acc, [v, arr[j + 1]]]), []) : Object.entries(reply);
      for (const [device, json] of entries) {
        try {
          targets.push({ id, device, sub: JSON.parse(json) });
        } catch {}
      }
    });
    if (!targets.length) return 0;
    const { publicKey: pub, privateKey } = await vapid();
    const options = {
      vapidDetails: { subject: `mailto:${process.env.VAPID_CONTACT || "president@kingsunion.org.uk"}`, publicKey: pub, privateKey },
      TTL: 24 * 3600,
      urgency: "normal",
      timeout: 5000,
    };
    const payload = JSON.stringify({ title: String(title).slice(0, 80), body: String(body).slice(0, 240), href, at: Date.now() });
    const results = await Promise.allSettled(targets.map((t) => webpush.sendNotification(t.sub, payload, options)));
    const gone = [];
    results.forEach((r, i) => {
      const code = r.status === "rejected" ? r.reason?.statusCode : 0;
      if (code === 404 || code === 410) gone.push(["HDEL", subsKey(targets[i].id), targets[i].device]);
      else if (r.status === "rejected") console.error("Push failed:", code || r.reason?.message);
    });
    if (gone.length) await pipeline(gone);
    return results.filter((r) => r.status === "fulfilled").length;
  } catch (err) {
    console.error("Push failed:", err);
    return 0;
  }
}

// Contact messages, Kingsway writer applications and ticket-alert sign-ups,
// saved in the voting database so nothing is lost when email isn't set up.
// Read them in the admin site.
//
// Keys:
//   ku:inbox:union      hash id -> message (JSON)
//   ku:inbox:kingsway   hash id -> writer application (JSON)
//   ku:alerts           hash email -> sign-up (JSON), so each address is kept once
import { randomBytes } from "node:crypto";
import { redis, pipeline } from "@/lib/store";

const MAX_STORED = 5000;

export const INBOXES = {
  union: { key: "ku:inbox:union", label: "Messages to the Union" },
  kingsway: { key: "ku:inbox:kingsway", label: "Kingsway writer applications" },
};
const ALERTS = "ku:alerts";

export const MESSAGE_STATUS = { new: "New", done: "Dealt with" };

const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));

export async function saveMessage(team, fields) {
  const box = INBOXES[team];
  if (!box) throw new Error("Unknown inbox.");
  if ((await redis("HLEN", box.key)) >= MAX_STORED) throw new Error("full");
  const item = { id: randomBytes(6).toString("hex"), team, status: "new", createdAt: Date.now(), ...fields };
  await redis("HSET", box.key, item.id, JSON.stringify(item));
  return item;
}

export async function listMessages(team) {
  const box = INBOXES[team];
  const raw = (await redis("HVALS", box.key)) || [];
  return raw.map((r) => JSON.parse(r)).sort((a, b) => b.createdAt - a.createdAt);
}

export async function setMessageStatus(team, id, status) {
  const box = INBOXES[team];
  if (!box || !isId(id) || !MESSAGE_STATUS[status]) throw new Error("Unknown message.");
  const raw = await redis("HGET", box.key, id);
  if (!raw) return null;
  const item = { ...JSON.parse(raw), status };
  await redis("HSET", box.key, id, JSON.stringify(item));
  return item;
}

export async function deleteMessage(team, id) {
  const box = INBOXES[team];
  if (!box || !isId(id)) return false;
  return Number(await redis("HDEL", box.key, id)) === 1;
}

// ---------- Ticket alerts ----------

export async function addAlert(email, name = "") {
  const key = email.trim().toLowerCase();
  if ((await redis("HLEN", ALERTS)) >= MAX_STORED) throw new Error("full");
  const item = { email: key, name, createdAt: Date.now() };
  // HSETNX keeps the first sign-up date if someone signs up twice.
  await redis("HSETNX", ALERTS, key, JSON.stringify(item));
  return item;
}

export async function listAlerts() {
  const raw = (await redis("HVALS", ALERTS)) || [];
  return raw.map((r) => JSON.parse(r)).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteAlert(email) {
  return Number(await redis("HDEL", ALERTS, String(email || "").trim().toLowerCase())) === 1;
}

export async function inboxCounts() {
  const [u, k, a] = await pipeline([["HVALS", INBOXES.union.key], ["HVALS", INBOXES.kingsway.key], ["HLEN", ALERTS]]);
  const fresh = (list) => (list || []).filter((r) => JSON.parse(r).status === "new").length;
  return { union: fresh(u), kingsway: fresh(k), alerts: Number(a) || 0 };
}

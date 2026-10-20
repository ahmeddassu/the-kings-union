// Emails to the ticket-alerts list, sent from admin → Ticket alerts.
//
// Each person gets their own email (nobody sees anyone else's address), with
// a one-click unsubscribe link, as UK law (PECR) requires for marketing email.
// Sending happens a few emails at a time, driven by the admin page, so it
// never hits Vercel's time limit and can be resumed if the page is closed.
//
// Needs email set up in Vercel (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
// see app/api/contact/route.js.
//
// Keys:
//   ku:mail:campaigns     hash id -> campaign (JSON)
//   ku:mail:<id>:todo     list of addresses still to send to
//   ku:mail:<id>:failed   list of addresses that couldn't be sent to
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { redis, pipeline } from "@/lib/store";
import { listAlerts, deleteAlert } from "@/lib/inbox";
import { siteUrl } from "@/lib/site";
import { UNION_EMAIL } from "@/lib/contact";

const K = {
  campaigns: "ku:mail:campaigns",
  todo: (id) => `ku:mail:${id}:todo`,
  failed: (id) => `ku:mail:${id}:failed`,
};
export const BATCH = 10;
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));

export const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transport = null;
function mailer() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      pool: true,
      maxConnections: 2,
    });
  }
  return transport;
}

// ---------- Unsubscribe links ----------

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_URL || process.env.KV_URL || "";
}

const tokenFor = (email) => createHmac("sha256", secret()).update(`unsubscribe:${email.toLowerCase()}`).digest("hex").slice(0, 32);

export function unsubscribeUrl(email) {
  const url = new URL("/unsubscribe", siteUrl);
  url.search = new URLSearchParams({ e: email, t: tokenFor(email) }).toString();
  return url.toString();
}

export function tokenValid(email, token) {
  if (!secret() || !email || !/^[a-f0-9]{32}$/.test(String(token || ""))) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(tokenFor(email)));
}

export async function unsubscribe(email, token) {
  if (!tokenValid(email, token)) return false;
  await deleteAlert(email);
  return true;
}

// ---------- The email ----------

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function cleanCampaign(input) {
  const subject = String(input.subject ?? "").replace(/\s+/g, " ").trim().slice(0, 150);
  const message = String(input.message ?? "").replace(/\r\n/g, "\n").trim().slice(0, 4000);
  const buttonText = String(input.buttonText ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  const buttonUrl = String(input.buttonUrl ?? "").trim().slice(0, 500);
  if (!subject) throw new Error("Please add a subject.");
  if (!message) throw new Error("Please write a message.");
  if (buttonUrl && !/^https:\/\//.test(buttonUrl)) throw new Error("The button link must start with https://");
  const event = input.event && typeof input.event === "object"
    ? {
        title: String(input.event.title ?? "").slice(0, 200),
        when: String(input.event.when ?? "").slice(0, 120),
        venue: String(input.event.venue ?? "").slice(0, 160),
        image: /^https:\/\//.test(input.event.image || "") ? String(input.event.image).slice(0, 500) : "",
      }
    : null;
  return { subject, message, buttonText: buttonUrl ? buttonText || "Get tickets" : "", buttonUrl, event };
}

export function renderEmail(c, email) {
  const unsub = unsubscribeUrl(email);
  const paras = c.message.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const text = [
    c.message,
    c.event ? `\n${c.event.title}\n${[c.event.when, c.event.venue].filter(Boolean).join(" · ")}` : "",
    c.buttonUrl ? `\n${c.buttonText}: ${c.buttonUrl}` : "",
    `\n—\nThe King’s Union, King’s College London\nYou’re getting this because you signed up for ticket alerts on kingsunion.org.uk.\nUnsubscribe: ${unsub}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4efe6;font-family:Georgia,'Times New Roman',serif;color:#2a0101">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:#3d0202;padding:22px 28px;border-bottom:3px solid #d4af37">
<a href="${siteUrl.origin}" style="color:#ffffff;text-decoration:none;font-size:22px;font-weight:bold"><em>the</em> King’s Union</a>
</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;color:#3d0202">${escapeHtml(c.subject)}</h1>
${paras.map((p) => `<p style="margin:0 0 14px;font-size:17px;line-height:1.6">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
${
  c.event
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border:1px solid #d4af37">
${c.event.image ? `<tr><td><img src="${escapeHtml(c.event.image)}" alt="" width="544" style="display:block;width:100%;height:auto"></td></tr>` : ""}
<tr><td style="padding:16px 18px"><p style="margin:0;font-size:19px;font-weight:bold;color:#3d0202">${escapeHtml(c.event.title)}</p>
<p style="margin:6px 0 0;font-size:15px;color:#5a3a3a">${escapeHtml([c.event.when, c.event.venue].filter(Boolean).join(" · "))}</p></td></tr></table>`
    : ""
}
${
  c.buttonUrl
    ? `<p style="margin:24px 0 8px"><a href="${escapeHtml(c.buttonUrl)}" style="display:inline-block;background:#d4af37;color:#3d0202;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 26px">${escapeHtml(c.buttonText)} →</a></p>`
    : ""
}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #eadfcf;font-size:13px;line-height:1.5;color:#7a6060">
The King’s Union, the debating society at King’s College London.<br>
You’re getting this because you signed up for ticket alerts on kingsunion.org.uk.
<a href="${escapeHtml(unsub)}" style="color:#7a6060">Unsubscribe</a>
</td></tr></table></td></tr></table></body></html>`;

  return { text, html, unsub };
}

async function sendOne(c, email) {
  const { text, html, unsub } = renderEmail(c, email);
  const oneClick = new URL("/api/unsubscribe", siteUrl);
  oneClick.search = new URL(unsub).search;
  await mailer().sendMail({
    from: `"The King’s Union" <${process.env.SMTP_USER}>`,
    to: email,
    replyTo: UNION_EMAIL,
    subject: c.subject,
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${oneClick.toString()}>, <mailto:${UNION_EMAIL}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

// ---------- Campaigns ----------

export async function sendTest(input, email) {
  if (!emailConfigured()) throw new Error("Email isn’t set up yet.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) throw new Error("Please enter an email address for the test.");
  const c = cleanCampaign(input);
  await sendOne({ ...c, subject: `[Test] ${c.subject}` }, email);
}

export async function startCampaign(input) {
  if (!emailConfigured()) throw new Error("Email isn’t set up yet.");
  const c = cleanCampaign(input);
  const people = await listAlerts();
  if (!people.length) throw new Error("Nobody has signed up for ticket alerts yet.");
  const id = randomBytes(6).toString("hex");
  const campaign = { id, ...c, total: people.length, sent: 0, failed: 0, createdAt: Date.now(), finishedAt: null };
  const cmds = [["HSET", K.campaigns, id, JSON.stringify(campaign)]];
  for (let i = 0; i < people.length; i += 500) cmds.push(["RPUSH", K.todo(id), ...people.slice(i, i + 500).map((p) => p.email)]);
  cmds.push(["EXPIRE", K.todo(id), 30 * 24 * 3600]);
  await pipeline(cmds);
  return campaign;
}

async function readCampaign(id) {
  if (!isId(id)) return null;
  const raw = await redis("HGET", K.campaigns, id);
  return raw ? JSON.parse(raw) : null;
}

// Sends the next few emails of a campaign. Call repeatedly until done.
export async function sendBatch(id) {
  const c = await readCampaign(id);
  if (!c) throw new Error("That email no longer exists.");
  if (!emailConfigured()) throw new Error("Email isn’t set up yet.");
  let batch = (await redis("LPOP", K.todo(id), BATCH)) || [];
  if (!Array.isArray(batch)) batch = [batch];
  // Someone may have unsubscribed since the email was started.
  const stillSubscribed = new Set((await listAlerts()).map((p) => p.email));
  let sent = 0;
  const failed = [];
  for (const email of batch) {
    if (!stillSubscribed.has(email)) continue;
    try {
      await sendOne(c, email);
      sent += 1;
    } catch (err) {
      console.error("Ticket alert email failed:", err.message);
      failed.push(email);
    }
  }
  const left = Number(await redis("LLEN", K.todo(id))) || 0;
  const updated = { ...c, sent: c.sent + sent, failed: c.failed + failed.length, finishedAt: left ? null : Date.now() };
  // If every email in a batch fails (e.g. the mailbox hit its daily limit), stop and keep them for later.
  const stuck = batch.length > 0 && sent === 0 && failed.length === batch.length;
  const cmds = [["HSET", K.campaigns, id, JSON.stringify(stuck ? { ...updated, failed: c.failed, finishedAt: null } : updated)]];
  if (stuck) cmds.push(["LPUSH", K.todo(id), ...failed.reverse()]);
  else if (failed.length) cmds.push(["RPUSH", K.failed(id), ...failed], ["EXPIRE", K.failed(id), 30 * 24 * 3600]);
  await pipeline(cmds);
  if (stuck) throw new Error("Emails are failing to send (the mailbox may have reached its daily limit). Nothing was lost: press Resume later.");
  return { campaign: stuck ? c : updated, left: stuck ? left + failed.length : left };
}

export async function listCampaigns() {
  const raw = (await redis("HVALS", K.campaigns)) || [];
  const list = raw.map((r) => JSON.parse(r)).sort((a, b) => b.createdAt - a.createdAt);
  if (!list.length) return [];
  const lefts = await pipeline(list.map((c) => ["LLEN", K.todo(c.id)]));
  return list.map((c, i) => ({ ...c, left: Number(lefts[i]) || 0 }));
}

export async function deleteCampaign(id) {
  if (!isId(id)) return false;
  const [n] = await pipeline([["HDEL", K.campaigns, id], ["DEL", K.todo(id)], ["DEL", K.failed(id)]]);
  return Number(n) === 1;
}

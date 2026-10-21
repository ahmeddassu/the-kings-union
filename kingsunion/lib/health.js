// Health checks for the website, the voting site and the things they rely on.
//
//  - /api/health answers an uptime monitor (see admin → Status for how to set
//    one up). It works on every address: www, voting and admin.
//  - admin → Status shows the same checks, plus backups and email.
//  - Every night, after the backup, the website checks itself and emails the
//    committee if something needs attention (ALERT_EMAIL in Vercel, or the
//    Union's address).
import { redis, storeConfigured } from "@/lib/store";
import { SHEET_ID, getEvents } from "@/lib/sheet";
import { emailConfigured, sendCommitteeEmail } from "@/lib/alert_mail";
import { blobConfigured, listBackups } from "@/lib/backup";
import { UNION_EMAIL } from "@/lib/contact";

export const ALERT_EMAIL = process.env.ALERT_EMAIL || UNION_EMAIL;

const londonToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

async function timed(fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    return { ok: true, ms: Date.now() - start, detail: detail || "" };
  } catch (err) {
    return { ok: false, ms: Date.now() - start, detail: err?.message || "Not responding" };
  }
}

// The database holds votes, forms and admin logins: without it, voting is down.
export function checkDatabase() {
  return timed(async () => {
    if (!storeConfigured) throw new Error("The database isn’t connected.");
    const reply = await Promise.race([
      redis("PING"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("The database didn’t answer in time.")), 4000)),
    ]);
    if (String(reply).toUpperCase() !== "PONG") throw new Error("The database gave an unexpected answer.");
  });
}

// The term card's Google Sheet. If it can't be read, the site still works, using
// the list in lib/events.js, but changes to the sheet won't show.
export function checkSheet() {
  return timed(async () => {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      throw new Error("The term card sheet couldn’t be reached.");
    });
    if (!res.ok) throw new Error(`The term card sheet returned an error (${res.status}).`);
    const text = await res.text();
    if (/"status":"error"/.test(text)) throw new Error("The term card sheet isn’t shared publicly.");
  });
}

// What's on today, so a monitor (or the committee) knows when it matters most.
export async function eventsToday() {
  const today = londonToday();
  try {
    return (await getEvents()).filter((e) => e.date === today).map((e) => ({ title: e.title, time: e.time || "" }));
  } catch {
    return [];
  }
}

// For /api/health: quick, and safe to show to anyone.
export async function quickHealth() {
  const [database, sheet, today] = await Promise.all([checkDatabase(), checkSheet(), eventsToday()]);
  const status = !database.ok ? "down" : !sheet.ok ? "degraded" : "ok";
  return {
    status,
    checks: {
      database: { ok: database.ok, ms: database.ms },
      termCard: { ok: sheet.ok, ms: sheet.ms },
    },
    eventToday: today.length > 0,
    time: new Date().toISOString(),
  };
}

// For admin → Status and the nightly check: everything, in plain English.
export async function fullHealth() {
  const [database, sheet, today, backups] = await Promise.all([
    checkDatabase(),
    checkSheet(),
    eventsToday(),
    blobConfigured() ? listBackups().catch(() => null) : Promise.resolve(null),
  ]);
  const latest = backups?.[0] || null;
  const backupAgeHours = latest ? (Date.now() - latest.uploadedAt) / 3600000 : null;

  const items = [
    {
      id: "database",
      label: "Database (votes, forms, admin logins)",
      ok: database.ok,
      detail: database.ok ? `Answering in ${database.ms} ms` : database.detail,
      critical: true,
    },
    {
      id: "sheet",
      label: "Term card Google Sheet",
      ok: sheet.ok,
      detail: sheet.ok ? `Readable (${sheet.ms} ms)` : `${sheet.detail} The website is showing the term card saved in the code until it’s fixed.`,
    },
    {
      id: "email",
      label: "Email (ticket alerts, reminders, forms)",
      ok: emailConfigured(),
      detail: emailConfigured() ? "Set up" : "Not set up: add SMTP_HOST, SMTP_USER and SMTP_PASS in Vercel.",
    },
    {
      id: "backups",
      label: "Nightly backups",
      ok: Boolean(latest) && backupAgeHours < 36,
      detail: !blobConfigured()
        ? "Not set up: connect a private Blob store in Vercel."
        : !latest
          ? "No backups yet."
          : `Last backup ${Math.round(backupAgeHours)} hour${Math.round(backupAgeHours) === 1 ? "" : "s"} ago${backupAgeHours >= 36 ? ": it should run every night." : "."}`,
    },
  ];
  return { items, today, ok: items.every((i) => i.ok), checkedAt: new Date().toISOString() };
}

// Run every night (after the backup). Emails the committee only if something
// needs attention, so no email means all is well.
export async function nightlyCheck({ backupFailed = false } = {}) {
  const health = await fullHealth();
  const problems = health.items.filter((i) => !i.ok && i.id !== "email");
  if (backupFailed && !problems.some((p) => p.id === "backups"))
    problems.push({ label: "Nightly backups", detail: "Tonight’s backup failed. Vercel’s logs for /api/cron/backup say why." });
  if (!problems.length || !emailConfigured()) return { sent: false, problems: problems.length };
  const text = [
    "The King’s Union website found something that needs attention:",
    "",
    ...problems.map((p) => `• ${p.label}: ${p.detail}`),
    "",
    "See admin → Status for details: https://admin.kingsunion.org.uk/status",
    "",
    "This email is sent automatically each night only when something is wrong.",
  ].join("\n");
  await sendCommitteeEmail({ to: ALERT_EMAIL, subject: "Website check: something needs attention", text });
  return { sent: true, problems: problems.length };
}

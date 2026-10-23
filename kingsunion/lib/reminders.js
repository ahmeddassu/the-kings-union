// Automatic "tomorrow" reminders to the ticket-alerts list: the day before
// each debate, everyone on the list gets an email with the motion, time,
// venue and a link to tickets. Run by Vercel Cron each morning (see
// vercel.json); switched on or off in admin → Ticket alerts.
//
// Each debate is only ever reminded once. Long lists are sent across several
// morning runs, a few minutes apart, so nothing times out.
//
// Keys:
//   ku:alerts-settings   hash: reminders = "off" when switched off
//   ku:reminded:<slug>   set once a debate's reminder has started (kept 30 days)
import { redis, storeConfigured } from "@/lib/store";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";
import { siteUrl } from "@/lib/site";
import { emailConfigured, startCampaign, sendBatch, listCampaigns } from "@/lib/alert_mail";
import { listAlerts } from "@/lib/inbox";
import { startFeedbackEmails } from "@/lib/feedback";

const SETTINGS = "ku:alerts-settings";
const londonDate = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const tomorrow = () => londonDate(new Date(Date.now() + 864e5));

export async function remindersOn() {
  if (!storeConfigured) return false;
  return (await redis("HGET", SETTINGS, "reminders")) !== "off";
}

export async function setReminders(on) {
  await redis("HSET", SETTINGS, "reminders", on ? "on" : "off");
}

// The debates whose reminder goes out tomorrow morning or later, soonest first.
export async function upcomingReminders(limit = 3) {
  const today = londonDate();
  return (await getEvents().catch(() => []))
    .filter((e) => e.type === "Debate" && e.date > today)
    .slice(0, limit)
    .map((e) => ({ slug: e.slug, title: e.title, date: e.date, sendOn: londonDate(new Date(Date.parse(`${e.date}T12:00:00Z`) - 864e5)) }));
}

export function reminderEmail(e) {
  const page = new URL(`/events/${e.slug}`, siteUrl).toString();
  const when = [longDate(e.date), e.time].filter(Boolean).join(", ");
  const hasTickets = /^https:\/\//.test(e.tickets || "");
  return {
    subject: `Tomorrow: ${e.title}`,
    message: [
      "A reminder that our next debate is tomorrow.",
      hasTickets ? "If you haven’t got your ticket yet, there’s still time: places are limited." : "Full details are on the debate’s page.",
      "On the debate’s page you can also add it to your calendar, and it will update itself if anything changes.",
    ].join("\n\n"),
    buttonText: hasTickets ? "Get your ticket" : "See the details",
    buttonUrl: hasTickets ? e.tickets : page,
    event: { title: e.title, when, venue: e.venue || "", image: e.photo ? new URL(e.photo, siteUrl).toString() : "" },
  };
}

// One run of the morning job. Starts tomorrow's reminders and the morning-after
// feedback emails (once each), then keeps sending any automatic email that
// isn't finished, for up to `budgetMs`.
export async function runReminders(budgetMs = 50000) {
  const started = Date.now();
  const report = { started: [], sent: 0, left: 0, skipped: null };
  if (!emailConfigured()) return { ...report, skipped: "Email isn’t set up." };
  const on = await remindersOn();
  if (!on) report.skipped = "Reminders are switched off.";

  if (on && (await listAlerts()).length) {
    const due = (await getEvents().catch(() => [])).filter((e) => e.type === "Debate" && e.date === tomorrow());
    for (const e of due) {
      // SET NX: only the first run ever starts this debate's reminder.
      const first = await redis("SET", `ku:reminded:${e.slug}`, String(Date.now()), "NX", "EX", 30 * 86400);
      if (!first) continue;
      const c = await startCampaign(reminderEmail(e), { auto: "reminder", slug: e.slug });
      report.started.push(c.subject);
    }
  }

  // The morning after a debate: ask for feedback (lib/feedback.js; its own on/off switch).
  report.started.push(...(await startFeedbackEmails().catch(() => [])));

  const pending = (await listCampaigns()).filter((c) => (c.auto === "reminder" || c.auto === "feedback") && c.left > 0);
  for (const c of pending) {
    let left = c.left;
    while (left > 0 && Date.now() - started < budgetMs) {
      try {
        const r = await sendBatch(c.id);
        report.sent += r.campaign.sent - (c.sent || 0);
        c.sent = r.campaign.sent;
        left = r.left;
      } catch (err) {
        console.error("Reminder sending paused:", err.message);
        break; // e.g. the mailbox's daily limit: the next run carries on
      }
    }
    report.left += left;
  }
  return report;
}

// "How was last night?": short, anonymous feedback on each debate.
//
//  - /feedback?debate=<slug> is the form (a rating, two optional comments and
//    whether they'd come again). No name or email is asked for.
//  - The morning after each debate, everyone on the ticket-alerts list gets an
//    email asking for feedback (sent by the same morning job as the reminders;
//    switched on or off in admin → Feedback). The link can also be pasted into
//    Luma's post-event email, which goes to the people who actually had tickets.
//  - admin → Feedback shows the results for each debate.
//
// Keys:
//   ku:feedback:<slug>        list of responses (JSON)
//   ku:feedback-asked:<slug>  set once a debate's feedback email has started (kept 30 days)
//   ku:alerts-settings        hash: feedback = "off" when the email is switched off
import { redis, storeConfigured } from "@/lib/store";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";
import { siteUrl } from "@/lib/site";
import { startCampaign } from "@/lib/alert_mail";
import { listAlerts } from "@/lib/inbox";

const SETTINGS = "ku:alerts-settings";
const key = (slug) => `ku:feedback:${slug}`;
const MAX_PER_DEBATE = 3000;
export const isSlug = (s) => /^[a-z0-9-]{1,90}$/.test(String(s || ""));

const londonDate = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const yesterday = () => londonDate(new Date(Date.now() - 864e5));
const clean = (v, max) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);

export const AGAIN = { yes: "Yes", maybe: "Maybe", no: "No" };

// Debates that have happened, newest first (the ones feedback can be left on).
export async function pastDebates() {
  const today = londonDate();
  return (await getEvents().catch(() => []))
    .filter((e) => e.type === "Debate" && e.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function feedbackUrl(slug) {
  return new URL(`/feedback?debate=${encodeURIComponent(slug)}`, siteUrl).toString();
}

export async function saveFeedback(slug, input) {
  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) throw new Error("rating");
  const response = {
    rating,
    liked: clean(input.liked, 1500),
    improve: clean(input.improve, 1500),
    again: AGAIN[input.again] ? input.again : "",
    at: Date.now(),
  };
  await redis("LPUSH", key(slug), JSON.stringify(response));
  await redis("LTRIM", key(slug), 0, MAX_PER_DEBATE - 1);
  return response;
}

// For admin: each past debate with its responses and a summary.
export async function feedbackSummary() {
  const debates = await pastDebates();
  const out = [];
  for (const e of debates) {
    const raw = (await redis("LRANGE", key(e.slug), 0, -1)) || [];
    const responses = raw.map((r) => JSON.parse(r));
    const n = responses.length;
    const dist = [1, 2, 3, 4, 5].map((s) => responses.filter((r) => r.rating === s).length);
    const againAnswered = responses.filter((r) => r.again);
    out.push({
      slug: e.slug,
      title: e.title,
      date: e.date,
      when: longDate(e.date),
      link: feedbackUrl(e.slug),
      count: n,
      average: n ? Math.round((responses.reduce((s, r) => s + r.rating, 0) / n) * 10) / 10 : null,
      dist,
      again: againAnswered.length
        ? Math.round((againAnswered.filter((r) => r.again === "yes").length / againAnswered.length) * 100)
        : null,
      comments: responses.filter((r) => r.liked || r.improve).map(({ rating, liked, improve, again, at }) => ({ rating, liked, improve, again, at })),
    });
  }
  return out;
}

export async function deleteFeedback(slug) {
  if (!isSlug(slug)) return;
  await redis("DEL", key(slug));
}

// ---------- The morning-after email ----------

export async function feedbackEmailOn() {
  if (!storeConfigured) return false;
  return (await redis("HGET", SETTINGS, "feedback")) !== "off";
}

export async function setFeedbackEmail(on) {
  await redis("HSET", SETTINGS, "feedback", on ? "on" : "off");
}

export function feedbackEmail(e) {
  return {
    subject: `How was last night? ${e.title}`,
    message: [
      "Thank you to everyone who came to last night’s debate.",
      "If you were there, we’d love to know what you thought. It takes under a minute, it’s anonymous, and every response is read by the committee.",
    ].join("\n\n"),
    buttonText: "Leave feedback",
    buttonUrl: feedbackUrl(e.slug),
    event: { title: e.title, when: longDate(e.date), venue: e.venue || "", image: "" },
  };
}

// Called by the morning job: starts the email for yesterday's debate (once each).
// Returns the subjects started. Sending is carried on by runReminders.
export async function startFeedbackEmails() {
  if (!(await feedbackEmailOn())) return [];
  if (!(await listAlerts()).length) return [];
  const started = [];
  const due = (await getEvents().catch(() => [])).filter((e) => e.type === "Debate" && e.date === yesterday());
  for (const e of due) {
    const first = await redis("SET", `ku:feedback-asked:${e.slug}`, String(Date.now()), "NX", "EX", 30 * 86400);
    if (!first) continue;
    const c = await startCampaign(feedbackEmail(e), { auto: "feedback", slug: e.slug });
    started.push(c.subject);
  }
  return started;
}

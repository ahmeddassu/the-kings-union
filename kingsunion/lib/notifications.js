// Admin notifications: the bell in the admin header.
//
// People are notified when a task is given to them or they're made its
// supervisor, when a task they supervise is ready for review, when theirs
// needs improvement, when their task goes overdue, when they're invited to
// something on the committee calendar, and when something new arrives for
// their team (messages, Kingsway applications, speaker applications, motion
// suggestions). Nobody is notified about their own actions.
//
// Keys:
//   ku:notes:<admin id>       list of JSON { id, at, text, href, kind } (newest first, last 100 kept)
//   ku:notes-read:<admin id>  when they last opened the bell (ms)
import { randomBytes } from "node:crypto";
import { redis, pipeline } from "@/lib/store";
import { TEAMS, teamsOf } from "@/lib/admin_auth";
import { sameName } from "@/lib/dashboard";
import { pushTo } from "@/lib/push";

const KEEP = 100;
const listKey = (id) => `ku:notes:${id}`;
const readKey = (id) => `ku:notes-read:${id}`;
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));

// Admin logins that can receive notifications (not turned off, password set).
async function logins() {
  const raw = (await redis("HVALS", "ku:admins")) || [];
  return raw
    .map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    })
    .filter((p) => p && isId(p.id) && !p.disabled && p.hash);
}

async function send(ids, note) {
  const unique = [...new Set(ids)].filter(isId);
  if (!unique.length) return 0;
  const item = JSON.stringify({ id: randomBytes(5).toString("hex"), at: Date.now(), kind: note.kind || "info", text: String(note.text).slice(0, 300), href: note.href || "" });
  const commands = unique.flatMap((id) => [
    ["LPUSH", listKey(id), item],
    ["LTRIM", listKey(id), 0, KEEP - 1],
  ]);
  await pipeline(commands);
  // And a pop-up on any phone or computer they've turned notifications on for.
  await pushTo(unique, { title: TITLES[note.kind] || "King’s Union admin", body: note.text, href: note.href || "" });
  return unique.length;
}

const TITLES = {
  task: "New task",
  review: "Ready for review",
  improve: "Needs improvement",
  overdue: "Overdue task",
  done: "Task complete",
  inbox: "New for your team",
  calendar: "Committee calendar",
};

// Everyone whose team can use any of `sections` (e.g. "applications").
export async function notifySections(sections, note, actor = null) {
  try {
    const want = [].concat(sections);
    const ids = (await logins())
      .filter((p) => p.id !== actor?.id)
      .filter((p) => teamsOf(p).some((t) => want.some((s) => TEAMS[t]?.can.includes(s))))
      .map((p) => p.id);
    return await send(ids, note);
  } catch (err) {
    console.error("Couldn't send notifications:", err);
    return 0;
  }
}

// The admin logins belonging to people named in tasks or invites. Names match
// loosely ("Maya Thompson" = "Maya Cecilia Thompson"), or through the team
// directory when someone's login uses the same email as their directory entry.
export async function loginsForNames(names, team = []) {
  const wanted = [...new Set([].concat(names).flatMap((n) => String(n || "").split(",")).map((n) => n.trim()).filter(Boolean))];
  if (!wanted.length) return [];
  const all = await logins();
  const ids = [];
  for (const name of wanted) {
    const emails = team.filter((m) => sameName(m.name, name) && m.email).map((m) => m.email.toLowerCase());
    for (const p of all) if (sameName(p.name, name) || emails.includes(String(p.email || "").toLowerCase())) ids.push(p.id);
  }
  return [...new Set(ids)];
}

export async function notifyNames(names, note, actor = null, team = []) {
  try {
    const ids = (await loginsForNames(names, team)).filter((id) => id !== actor?.id);
    return await send(ids, note);
  } catch (err) {
    console.error("Couldn't send notifications:", err);
    return 0;
  }
}

// ---------- Reading ----------

export async function getNotes(admin, limit = 30) {
  if (!admin || !isId(admin.id)) return { notes: [], unread: 0 };
  const [raw, readAt] = await pipeline([
    ["LRANGE", listKey(admin.id), 0, limit - 1],
    ["GET", readKey(admin.id)],
  ]);
  const notes = (raw || []).map((r) => JSON.parse(r));
  const since = Number(readAt || 0);
  return { notes: notes.map((n) => ({ ...n, unread: n.at > since })), unread: notes.filter((n) => n.at > since).length };
}

export async function markRead(admin) {
  if (!admin || !isId(admin.id)) return;
  await redis("SET", readKey(admin.id), String(Date.now()));
}

export async function clearNotes(admin) {
  if (!admin || !isId(admin.id)) return;
  await redis("DEL", listKey(admin.id));
}

// ---------- Tasks ----------

const STATUS = { review: "Ready for review", improve: "Needs improvement", overdue: "Overdue", complete: "Complete", in_progress: "In progress" };
const short = (s) => (String(s).length > 90 ? `${String(s).slice(0, 87)}…` : String(s));

// After a task is created or changed. `before` is null for a new task.
export async function notifyTaskChange(before, task, actor, team = []) {
  const href = `/dashboard?task=${encodeURIComponent(task.id)}`;
  const what = `${task.id}: ${short(task.title)}`;
  const jobs = [];
  if (task.owner && task.owner !== before?.owner)
    jobs.push(notifyNames(task.owner, { kind: "task", text: `${actor.name} gave you a task. ${what}`, href }, actor, team));
  if (task.supervisor && task.supervisor !== before?.supervisor)
    jobs.push(notifyNames(task.supervisor, { kind: "task", text: `You’re supervising ${what} (${actor.name})`, href }, actor, team));
  if (before && task.status !== before.status) {
    if (task.status === "review" && task.supervisor)
      jobs.push(notifyNames(task.supervisor, { kind: "review", text: `Ready for review: ${what}`, href }, actor, team));
    if (task.status === "improve" && task.owner)
      jobs.push(notifyNames(task.owner, { kind: "improve", text: `${actor.name} says this needs improvement. ${what}`, href }, actor, team));
    if (task.status === "complete" && task.supervisor)
      jobs.push(notifyNames(task.supervisor, { kind: "done", text: `Complete: ${what}`, href }, actor, team));
  }
  await Promise.all(jobs);
}

// Morning job: tell owners (and supervisors) about tasks that have gone past
// their deadline, once per deadline.
export async function notifyOverdue(tasks, team = []) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  let sent = 0;
  for (const t of tasks) {
    if (t.status === "complete" || !t.deadline || t.deadline >= today) continue;
    const first = await redis("SET", `ku:notes-overdue:${t.id}:${t.deadline}`, "1", "NX", "EX", 60 * 86400);
    if (!first) continue;
    const due = new Date(`${t.deadline}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
    const note = { kind: "overdue", text: `Overdue (was due ${due}): ${t.id}: ${short(t.title)}`, href: `/dashboard?task=${encodeURIComponent(t.id)}` };
    sent += await notifyNames([t.owner, t.supervisor].filter(Boolean), note, null, team);
  }
  return sent;
}

export { STATUS as TASK_STATUS_LABELS };

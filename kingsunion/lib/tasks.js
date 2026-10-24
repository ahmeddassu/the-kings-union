// Committee tasks (admin → Dashboard). Tasks used to be kept in the "King's
// Union Dashboard" Google Sheet; they were copied in once (importFromSheet) and
// now live here, so the dashboard's dropdowns can save straight away. The
// team directory lives in the website too (lib/team.js).
//
// Keys:
//   ku:tasks            hash: task id → JSON task
//   ku:task-seq         hash: department → last number used for its task ids
//   ku:task-leaders     hash: department → JSON list of names (owner/supervisor choices)
//   ku:tasks-imported   set once the sheet's tasks have been copied in
import { redis, pipeline } from "@/lib/store";
import { DEPARTMENTS, getDashboard, departmentsOf, sameName } from "@/lib/dashboard";
import { getTeam } from "@/lib/team";

const KEY = "ku:tasks";
const SEQ = "ku:task-seq";
const LEADERS = "ku:task-leaders";
const IMPORTED = "ku:tasks-imported";
const MAX_TASKS = 3000;

export const STATUSES = [
  { id: "in_progress", label: "In progress" },
  { id: "review", label: "Ready for review" },
  { id: "improve", label: "Needs improvement" },
  { id: "overdue", label: "Overdue" },
  { id: "complete", label: "Complete" },
];
const STATUS_IDS = STATUSES.map((s) => s.id);

// Task id prefixes, as the sheet used them.
export const PREFIX = {
  Presidential: "P",
  "Events & Programming": "EAP",
  "Growth & Marketing": "GAM",
  "Legal & Governance": "LAG",
  Finance: "FIN",
  Kingsway: "KWY",
};

const clean = (v, max) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/\s+/g, " ");
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isTaskId = (s) => /^[A-Z]{1,4}\d{1,6}$/.test(String(s || ""));

export const isExec = (admin) => Boolean(admin?.teams?.some((t) => t === "executive" || t === "super"));

// Who may change a task: the Executive and super admins, or anyone in the
// task's department.
export function canEdit(admin, myDepts, dept) {
  return isExec(admin) || myDepts.includes(dept);
}

// ---------- Reading ----------

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

export async function listTasks() {
  const raw = toMap(await redis("HGETALL", KEY));
  const tasks = [];
  for (const json of Object.values(raw)) {
    try {
      tasks.push(JSON.parse(json));
    } catch {
      // skip a damaged record
    }
  }
  return tasks;
}

async function getTask(id) {
  if (!isTaskId(id)) return null;
  const json = await redis("HGET", KEY, id);
  return json ? JSON.parse(json) : null;
}

// ---------- Leaders (the owner and supervisor choices) ----------

// Senior enough to own or supervise a department's tasks by default.
const LEAD = /^president\b|vice president|chief of staff|director|editor-in-chief|deic|deputy editor|\bhead\b|manager/i;

// The roles someone holds in one department (a role naming another department,
// like "Director of Finance", belongs to that one).
function rolesIn(person, dept) {
  const parts = String(person.role || "").split(",").map((x) => x.trim()).filter(Boolean);
  const here = parts.filter((x) => !DEPARTMENTS.some((d) => d !== dept && x.toLowerCase().includes(d.toLowerCase())));
  return here.length ? here : parts;
}

export function defaultLeaders(team, dept) {
  const names = team.filter((p) => p.departments.includes(dept) && rolesIn(p, dept).some((r) => LEAD.test(r))).map((p) => p.name);
  return [...new Set(names)];
}

// Owners and supervisors for every department (saved under "*"), as well as
// each department's own leaders. Until the Executive changes it, that's the
// President, the Chief of Staff and the Deputy Chief of Staff.
export const EVERY = "*";
const DEFAULT_EVERYWHERE = ["Mustafa Dassu", "Guy de Basto", "Maya Thompson"];

// Each department's own list, plus EVERY: the people available in all of them.
export async function getLeaders(team) {
  const saved = toMap(await redis("HGETALL", LEADERS));
  const read = (k) => {
    try {
      const list = saved[k] ? JSON.parse(saved[k]) : null;
      return Array.isArray(list) ? list : null;
    } catch {
      return null;
    }
  };
  // Use the team directory's spelling of each default name ("Maya Cecilia Thompson").
  const everywhere = read(EVERY) || DEFAULT_EVERYWHERE.map((n) => team.find((p) => sameName(p.name, n))?.name || n);
  const out = { [EVERY]: everywhere };
  for (const d of DEPARTMENTS) out[d] = read(d) || defaultLeaders(team, d).filter((n) => !everywhere.some((e) => sameName(e, n)));
  return out;
}

export async function setLeaders(dept, names) {
  if (dept !== EVERY && !DEPARTMENTS.includes(dept)) throw new Error("Choose a department.");
  const list = [...new Set((Array.isArray(names) ? names : []).map((n) => oneLine(n, 80)).filter(Boolean))].slice(0, 30);
  await redis("HSET", LEADERS, dept, JSON.stringify(list));
  return list;
}

// ---------- Changing tasks ----------

function checked(input, { partial = false } = {}) {
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(input, k);
  if (!partial || has("title")) {
    out.title = clean(input.title, 400);
    if (!out.title) throw new Error("Give the task a description.");
  }
  if (!partial || has("dept")) {
    if (!DEPARTMENTS.includes(input.dept)) throw new Error("Choose a department.");
    out.dept = input.dept;
  }
  if (!partial || has("status")) {
    out.status = STATUS_IDS.includes(input.status) ? input.status : "in_progress";
  }
  if (!partial || has("deadline")) {
    const d = String(input.deadline || "");
    if (d && !isDate(d)) throw new Error("That deadline isn’t a date.");
    out.deadline = d;
  }
  if (!partial || has("time")) {
    const t = String(input.time || "");
    if (t && !isTime(t)) throw new Error("That time isn’t valid.");
    out.time = t;
  }
  for (const k of ["owner", "supervisor", "unit"]) if (!partial || has(k)) out[k] = oneLine(input[k], 120);
  if (!partial || has("notes")) out.notes = clean(input.notes, 2000);
  if (!partial || has("link")) {
    const l = oneLine(input.link, 500);
    if (l && !/^https:\/\/\S+$/.test(l)) throw new Error("Links must start with https://");
    out.link = l;
  }
  return out;
}

async function nextId(dept) {
  const prefix = PREFIX[dept] || "T";
  const n = Number(await redis("HINCRBY", SEQ, dept, 1));
  return `${prefix}${String(n).padStart(prefix === "P" ? 3 : 4, "0")}`;
}

export async function createTask(input, admin) {
  if (Number(await redis("HLEN", KEY)) >= MAX_TASKS) throw new Error("The task list is full. Delete some old tasks first.");
  const fields = checked(input);
  let id = await nextId(fields.dept);
  while (Number(await redis("HEXISTS", KEY, id))) id = await nextId(fields.dept);
  const now = Date.now();
  const task = { id, ...fields, createdAt: now, createdBy: admin.name, updatedAt: now, updatedBy: admin.name, completedAt: fields.status === "complete" ? now : null };
  await redis("HSET", KEY, id, JSON.stringify(task));
  return task;
}

// Applies `changes` to a task. The caller has checked the person may edit the
// task's current department (and the new one, if it moves).
export async function updateTask(id, changes, admin) {
  const task = await getTask(id);
  if (!task) throw new Error("That task has been deleted.");
  const fields = checked(changes, { partial: true });
  const next = { ...task, ...fields, updatedAt: Date.now(), updatedBy: admin.name };
  if (fields.status && fields.status !== task.status) next.completedAt = fields.status === "complete" ? Date.now() : null;
  await redis("HSET", KEY, id, JSON.stringify(next));
  return { before: task, task: next };
}

export async function deleteTask(id) {
  const task = await getTask(id);
  if (!task) return null;
  await redis("HDEL", KEY, id);
  return task;
}

export async function findTask(id) {
  return getTask(id);
}

// ---------- Copying tasks in from the sheet ----------

function statusFromSheet(progress) {
  const p = String(progress || "").toLowerCase().replace(/[^a-z]/g, "");
  if (["complete", "completed", "done"].includes(p)) return "complete";
  if (p === "overdue") return "overdue";
  if (p.includes("review")) return "review";
  if (p.includes("improve")) return "improve";
  return "in_progress";
}

// Copies every task from the sheet that isn't here yet (matched by task id).
// Returns how many were added.
export async function importFromSheet() {
  const { departments } = await getDashboard();
  const have = new Set((await listTasks()).map((t) => t.id));
  const seq = toMap(await redis("HGETALL", SEQ));
  const commands = [];
  let added = 0;
  const now = Date.now();
  for (const d of departments) {
    if (!d.loaded) continue;
    for (const t of d.tasks) {
      const id = isTaskId(t.id) ? t.id : null;
      if (!id || have.has(id)) continue;
      const deadline = t.deadline;
      const status = statusFromSheet(t.progress);
      const notes = [t.deliverable ? `Deliverable: ${t.deliverable}` : "", t.comments].filter(Boolean).join("\n");
      const task = {
        id,
        dept: d.name,
        title: clean(t.description, 400),
        status,
        deadline: deadline?.date || "",
        time: deadline?.time || "",
        owner: oneLine(t.owners.join(", "), 120),
        supervisor: oneLine(t.supervisor, 120),
        unit: oneLine(t.unit, 120),
        notes: clean(notes, 2000),
        link: t.link || "",
        createdAt: now,
        createdBy: "Copied from the dashboard sheet",
        updatedAt: now,
        updatedBy: "Copied from the dashboard sheet",
        completedAt: status === "complete" ? now : null,
      };
      commands.push(["HSET", KEY, id, JSON.stringify(task)]);
      have.add(id);
      added++;
      // Keep new ids after the sheet's highest number in each department.
      const n = Number(id.replace(/^\D+/, ""));
      if (n > Number(seq[d.name] || 0)) seq[d.name] = n;
    }
  }
  for (const [dept, n] of Object.entries(seq)) commands.push(["HSET", SEQ, dept, String(n)]);
  if (commands.length) await pipeline(commands);
  return added;
}

// The first time the dashboard opens, copy the sheet's tasks in.
export async function importOnce() {
  const first = await redis("SET", IMPORTED, String(Date.now()), "NX");
  if (!first) return 0;
  try {
    return await importFromSheet();
  } catch (err) {
    await redis("DEL", IMPORTED); // try again next time
    throw err;
  }
}

// ---------- Everything the dashboard needs ----------

export async function dashboardData(admin) {
  await importOnce().catch((err) => console.error("Couldn't copy tasks from the sheet:", err));
  const [tasks, teamResult] = await Promise.all([listTasks(), getTeam()]);
  const { team, error } = teamResult;
  const leaders = await getLeaders(team);
  const myDepts = departmentsOf(admin, team);
  return { tasks, team, leaders, myDepts, teamError: error };
}

// The departments whose tasks someone may change (see canEdit).
export async function myDepartments(admin) {
  return departmentsOf(admin, (await getTeam()).team);
}

// ---------- Spreadsheet download ----------

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function tasksCsv(tasks) {
  const label = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]));
  const head = ["Task ID", "Department", "Task Description", "Progress", "Deadline", "Time", "Owner", "Supervisor", "Unit", "Link", "Notes", "Last updated by", "Last updated"];
  const rows = tasks.map((t) => [
    t.id, t.dept, t.title, label[t.status] || t.status, t.deadline, t.time, t.owner, t.supervisor, t.unit, t.link, t.notes, t.updatedBy,
    t.updatedAt ? new Date(t.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "",
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

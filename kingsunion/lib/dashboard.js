// The committee dashboard (admin → Dashboard), read from the "King's Union
// Dashboard" Google Sheet.
//
// The committee keeps working in the sheet as before; admin shows each
// department's tasks, what's overdue, and who's on the committee. Changes show
// up within about two minutes. The sheet must be shared as "Anyone with the
// link: Viewer". Each department is a tab with the columns Task ID, Task
// Description, Progress, Deadline, Owner/s, Supervisor and Deliverable/s
// (Unit and Comments are optional). Rows without a description are skipped.
//
// The Team Structure tab gives Who's who. Contact details (WhatsApp number and
// email) are only shown to people in the same department, and to the Executive
// and super admins; everyone else sees names and roles (see contactsFor).
export const DASHBOARD_SHEET_ID =
  process.env.DASHBOARD_SHEET_ID || "1XdREoml_Hsb2yHMP_XUYbL5OjwGWcL5tWaqedvirSxg";

// The department tabs, in the order they're shown. A new tab needs adding here.
export const DEPARTMENTS = [
  "Presidential",
  "Events & Programming",
  "Growth & Marketing",
  "Legal & Governance",
  "Finance",
  "Kingsway",
];

// Which department each admin team sees first.
export const TEAM_DEPARTMENT = {
  events: "Events & Programming",
  growth: "Growth & Marketing",
  finance: "Finance",
  kingsway: "Kingsway",
  legal: "Legal & Governance",
};

const REFRESH_SECONDS = 120;
const sheetUrl = (tab) =>
  `https://docs.google.com/spreadsheets/d/${DASHBOARD_SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;

// A small CSV reader (quoted fields, commas and line breaks inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(field), (field = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field), rows.push(row), (row = []), (field = "");
    } else field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows;
}

const key = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z]/g, "");
const pad = (n) => String(n).padStart(2, "0");

// Rows as objects keyed by simplified header ("Owner/s" → "owners").
function records(csv) {
  const [head = [], ...rows] = parseCsv(csv);
  const cols = head.map(key);
  return rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, String(r[i] ?? "").trim()])));
}

// "10/10/2026 00:00:00" (UK style) or "2026-10-10" → { date: "2026-10-10", time: "" | "15:00" }
export function parseDeadline(s) {
  const t = String(s || "").trim();
  let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  let date, h, min;
  if (m) (date = `${m[3]}-${pad(m[2])}-${pad(m[1])}`), (h = m[4]), (min = m[5]);
  else if ((m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/))) (date = `${m[1]}-${m[2]}-${m[3]}`), (h = m[4]), (min = m[5]);
  else return null;
  const time = h != null && !(+h === 0 && +min === 0) ? `${pad(h)}:${min}` : "";
  return { date, time };
}

export const splitNames = (s) =>
  String(s || "")
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const londonNow = () => {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-CA", { timeZone: "Europe/London" }),
    time: d.toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false }),
  };
};

// The status shown in admin. "Overdue" is worked out from the deadline, so it
// doesn't depend on someone remembering to change the Progress cell.
export function statusOf(progress, deadline, now = londonNow()) {
  const p = key(progress);
  if (p === "complete" || p === "completed" || p === "done") return "done";
  const late =
    deadline && (deadline.date < now.date || (deadline.date === now.date && deadline.time && deadline.time < now.time));
  if (p === "needsassigning") return "unassigned"; // shown with a red deadline if it's late
  if (late || p === "overdue") return "overdue";
  if (p === "notstarted" || p === "todo" || !p) return "todo";
  return "doing";
}

async function fetchTab(tab) {
  const res = await fetch(sheetUrl(tab), { next: { revalidate: REFRESH_SECONDS } });
  if (!res.ok) throw new Error(`The sheet returned ${res.status}`);
  const text = await res.text();
  // A private sheet sends back Google's sign-in page instead of CSV.
  if (/^\s*</.test(text)) throw new Error("The sheet isn’t shared as “Anyone with the link”.");
  return records(text);
}

const safeLink = (s) => (/^https:\/\/\S+$/.test(s) ? s : "");

export async function getDashboard() {
  const results = await Promise.allSettled([...DEPARTMENTS.map(fetchTab), fetchTab("Team Structure")]);
  const errors = results.filter((r) => r.status === "rejected").map((r) => r.reason?.message || "Couldn’t read the sheet");
  const now = londonNow();

  const departments = DEPARTMENTS.map((name, i) => {
    const rows = results[i].status === "fulfilled" ? results[i].value : [];
    const tasks = rows
      .filter((r) => r.taskdescription)
      .map((r) => {
        const deadline = parseDeadline(r.deadline);
        const deliverable = r.deliverables || "";
        return {
          id: r.taskid,
          department: name,
          description: r.taskdescription,
          progress: r.progress,
          status: statusOf(r.progress, deadline, now),
          late: statusOf("", deadline, now) === "overdue",
          deadline,
          unit: r.unit && r.unit !== "N/A" ? r.unit : "",
          owners: splitNames(r.owners),
          supervisor: r.supervisor,
          deliverable: safeLink(deliverable) ? "" : deliverable,
          link: safeLink(deliverable),
          comments: r.comments || "",
        };
      });
    return { name, loaded: results[i].status === "fulfilled", tasks };
  });

  const team = teamFrom(results[DEPARTMENTS.length].status === "fulfilled" ? results[DEPARTMENTS.length].value : []);
  return { departments, team, errors: [...new Set(errors)] };
}

function teamFrom(rows) {
  return rows
    .filter((r) => r.name)
    .map((r) => ({
      name: r.name,
      role: r.role,
      departments: splitNames(r.department).filter((d) => d !== "N/A"),
      unit: r.unit && r.unit !== "N/A" ? r.unit : "",
      whatsapp: r.whatsappnumber || "",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.contactemail || "") ? r.contactemail : "",
    }));
}

// Just Team Structure (who's who), for the dashboard now that tasks live in
// the website.
export async function getTeam() {
  try {
    return { team: teamFrom(await fetchTab("Team Structure")), error: "" };
  } catch (err) {
    return { team: [], error: err?.message || "Couldn’t read the sheet" };
  }
}

// ---------- Matching admin logins to people in the sheet ----------
//
// Names don't have to be typed identically in both places. Someone's admin
// login matches their Team Structure row if the emails match, or the full names
// match (ignoring case, accents and spacing), or the first and last names match
// ("Maya Thompson" ↔ "Maya Cecilia Thompson").
const plain = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z' -]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const firstLast = (s) => {
  const w = plain(s).split(" ").filter(Boolean);
  return w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : w[0] || "";
};
export const sameName = (a, b) => Boolean(plain(a)) && (plain(a) === plain(b) || firstLast(a) === firstLast(b));

// The Team Structure rows that are this admin (someone can have several, one
// per department), or [] if they aren't in the sheet.
export function rowsFor(admin, team) {
  const email = String(admin.email || "").toLowerCase();
  const byEmail = email ? team.filter((p) => p.email && p.email.toLowerCase() === email) : [];
  const name = byEmail[0]?.name || admin.name;
  return team.filter((p) => byEmail.includes(p) || sameName(p.name, name));
}

// Whether a task is theirs: their login name or their name in the sheet is
// in Owner/s.
export const isOwner = (task, names) => names.some((n) => task.owners.some((o) => sameName(o, n)));

// The departments someone belongs to: from their admin teams, plus any listed
// next to their name in Team Structure (e.g. Legal & Governance, which has no
// admin team of its own).
export function departmentsOf(admin, team) {
  const own = admin.teams.map((t) => TEAM_DEPARTMENT[t]).filter(Boolean);
  const listed = rowsFor(admin, team).flatMap((p) => p.departments);
  return [...new Set([...own, ...listed])];
}

// Who's who as this admin may see it: contact details only for people who
// share a department with them (everyone, for the Executive and super admins).
// Runs on the server, so hidden details never reach the browser.
export function contactsFor(admin, team) {
  const all = admin.teams.includes("executive") || admin.teams.includes("super");
  const mine = new Set(departmentsOf(admin, team));
  return team.map((p) => {
    const show = all || p.departments.some((d) => mine.has(d));
    return show ? p : { ...p, whatsapp: "", email: "" };
  });
}

// "7765220965" → { text: "07765 220965", href: "https://wa.me/447765220965" };
// numbers written with a country code ("49 17634434594") are kept as international.
export function whatsapp(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const digits = s.replace(/\D/g, "");
  if (/^0?7\d{9}$/.test(digits)) {
    const n = digits.replace(/^0/, "");
    return { text: `0${n.slice(0, 4)} ${n.slice(4)}`, href: `https://wa.me/44${n}` };
  }
  if (/^44\d{10}$/.test(digits)) return { text: `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`, href: `https://wa.me/${digits}` };
  if (digits.length >= 8) return { text: `+${s.replace(/^\+/, "")}`, href: `https://wa.me/${digits}` };
  return { text: s, href: "" };
}

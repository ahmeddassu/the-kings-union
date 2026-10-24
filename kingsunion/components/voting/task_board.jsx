"use client";

// The committee task board (admin → Dashboard). Everything saves as soon as
// it's changed; the list refreshes every 30 seconds so everyone sees the same.
import { useMemo, useRef, useState } from "react";
import usePoll from "@/components/voting/use_poll";

const STATUSES = [
  { id: "overdue", label: "Overdue", cls: "bg-[#f3c4c4] text-[#4a0606] border-[#f3c4c4]" },
  { id: "improve", label: "Needs improvement", cls: "bg-[#f2d48b] text-[#3d2a02] border-[#f2d48b]" },
  { id: "review", label: "Ready for review", cls: "bg-[#c9daf4] text-[#0f2547] border-[#c9daf4]" },
  { id: "in_progress", label: "In progress", cls: "bg-transparent text-white border-white/45" },
  { id: "complete", label: "Complete", cls: "bg-[#c7e6c2] text-[#123d12] border-[#c7e6c2]" },
];
const STATUS = Object.fromEntries(STATUSES.map((s) => [s.id, s]));
const ORDER = STATUSES.map((s) => s.id);

const input =
  "h-9 w-full rounded-sm border border-white/25 bg-[#1f0101] px-2 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none";
const btn = "inline-flex h-9 items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap";
const primary = `${btn} bg-[#d4af37] text-[#2a0101] hover:bg-white`;
const ghost = `${btn} border border-white/25 text-white hover:bg-white/10`;

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const nowTime = () => new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false });
const isLate = (t) =>
  t.status !== "complete" && t.deadline && (t.deadline < today() || (t.deadline === today() && t.time && t.time < nowTime()));
const needsAttention = (t) => t.status === "overdue" || isLate(t);

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  const sameYear = iso.slice(0, 4) === today().slice(0, 4);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: sameYear ? undefined : "numeric", timeZone: "UTC" });
}

function ago(ms) {
  if (!ms) return "";
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
}

// "Maya Thompson" matches "Maya Cecilia Thompson".
const plain = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const firstLast = (s) => {
  const w = plain(s).split(" ").filter(Boolean);
  return w.length > 1 ? `${w[0]} ${w[w.length - 1]}` : w[0] || "";
};
const sameName = (a, b) => Boolean(plain(a)) && (plain(a) === plain(b) || firstLast(a) === firstLast(b));
const involves = (t, names) => names.some((n) => String(t.owner).split(",").some((o) => sameName(o, n)) || sameName(t.supervisor, n));

// ---------- Small pieces ----------

function StatusSelect({ value, onChange, disabled, id, label }) {
  const s = STATUS[value] || STATUS.in_progress;
  return (
    <select
      id={id}
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`h-8 w-full min-w-[9.5rem] cursor-pointer appearance-none rounded-full border px-3 pr-7 text-xs font-bold tracking-wide disabled:cursor-default ${s.cls} bg-[length:10px] bg-[right_10px_center] bg-no-repeat`}
      style={{
        backgroundImage: disabled
          ? "none"
          : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='currentColor' stroke-width='1.5'/%3E%3C/svg%3E\")",
      }}
    >
      {STATUSES.map((o) => (
        <option key={o.id} value={o.id} className="bg-white text-black">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function PersonSelect({ value, options, onChange, disabled, label, id }) {
  const list = value && !options.some((o) => o === value) ? [...options, value] : options;
  if (disabled) return <span className="block truncate text-sm text-white/85">{value || <span className="text-white/40">—</span>}</span>;
  return (
    <select id={id} aria-label={label} value={value || ""} onChange={(e) => onChange(e.target.value)} className={`${input} h-8 cursor-pointer pr-1`}>
      <option value="" className="bg-white text-black">Unassigned</option>
      {list.map((n) => (
        <option key={n} value={n} className="bg-white text-black">
          {n}
        </option>
      ))}
    </select>
  );
}

function DeadlineInput({ task, onChange, disabled, label }) {
  const late = isLate(task);
  if (disabled)
    return (
      <span className={`text-sm tabular-nums ${late ? "font-bold text-[#f3c4c4]" : "text-white/85"}`}>
        {task.deadline ? `${shortDate(task.deadline)}${task.time ? `, ${task.time}` : ""}` : "—"}
      </span>
    );
  return (
    <input
      type="date"
      aria-label={label}
      value={task.deadline || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${input} h-8 tabular-nums [color-scheme:dark] ${late ? "!border-[#f3c4c4] font-bold !text-[#f3c4c4]" : ""}`}
    />
  );
}

// ---------- Details panel (description, notes, link, department, delete) ----------

function Details({ task, editable, departments, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: task.title, notes: task.notes || "", link: task.link || "", unit: task.unit || "", time: task.time || "", dept: task.dept,
  });
  const [confirming, setConfirming] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const changed = Object.keys(form).some((k) => (form[k] || "") !== (task[k] || ""));
  const save = (e) => {
    e.preventDefault();
    onSave(form, true);
  };
  const lab = "block text-xs font-semibold uppercase tracking-wider text-white/55";
  return (
    <form onSubmit={save} className="grid gap-4 border-t border-white/10 bg-[#1f0101] p-4 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className={lab}>Description</span>
        <textarea value={form.title} onChange={set("title")} disabled={!editable} rows={2} maxLength={400} required className={`${input} mt-1 h-auto py-2`} />
      </label>
      <label>
        <span className={lab}>Notes</span>
        <textarea value={form.notes} onChange={set("notes")} disabled={!editable} rows={3} maxLength={2000} placeholder="Progress, blockers, what's left" className={`${input} mt-1 h-auto py-2`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={lab}>Deliverable link</span>
          <input type="url" value={form.link} onChange={set("link")} disabled={!editable} placeholder="https://" className={`${input} mt-1`} />
        </label>
        <label>
          <span className={lab}>Unit</span>
          <input value={form.unit} onChange={set("unit")} disabled={!editable} maxLength={120} placeholder="e.g. Invitations" className={`${input} mt-1`} />
        </label>
        <label>
          <span className={lab}>Due time</span>
          <input type="time" value={form.time} onChange={set("time")} disabled={!editable} className={`${input} mt-1 [color-scheme:dark]`} />
        </label>
        <label className="sm:col-span-2">
          <span className={lab}>Department</span>
          <select value={form.dept} onChange={set("dept")} disabled={!editable} className={`${input} mt-1`}>
            {departments.map((d) => (
              <option key={d} value={d} className="bg-white text-black">{d}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:col-span-2">
        {editable && (
          <button type="submit" disabled={!changed} className={`${primary} disabled:opacity-40`}>
            Save details
          </button>
        )}
        <button type="button" onClick={onClose} className={ghost}>Close</button>
        {task.link && (
          <a href={task.link} target="_blank" rel="noopener noreferrer" className={`${ghost} text-[#d4af37]`}>
            Open deliverable
          </a>
        )}
        <span className="text-xs text-white/50 sm:ml-2">
          {task.id} · updated {ago(task.updatedAt)}{task.updatedBy ? ` by ${task.updatedBy}` : ""}
        </span>
        {editable && (
          <span className="ml-auto">
            {confirming ? (
              <span className="flex items-center gap-2 text-sm">
                Delete this task?
                <button type="button" onClick={onDelete} className={`${btn} bg-[#f3c4c4] text-[#4a0606]`}>Delete</button>
                <button type="button" onClick={() => setConfirming(false)} className={ghost}>Keep</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className={`${btn} text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>
                Delete task
              </button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}

// ---------- New task ----------

function NewTask({ departments, defaultDept, leaders, onCreate, onCancel }) {
  const [form, setForm] = useState({ title: "", dept: defaultDept, status: "in_progress", deadline: "", owner: "", supervisor: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    const ok = await onCreate(form);
    setBusy(false);
    if (ok) setForm((f) => ({ ...f, title: "", deadline: "", owner: "", supervisor: "" }));
  };
  const people = leaders[form.dept] || [];
  const lab = "block text-xs font-semibold uppercase tracking-wider text-white/55";
  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-sm border border-[#d4af37]/60 bg-[#2a0101] p-4 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[3fr_1.2fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="md:col-span-3 lg:col-span-1">
        <span className={lab}>New task</span>
        <input autoFocus value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={400} required placeholder="What needs doing?" className={`${input} mt-1`} />
      </label>
      <label>
        <span className={lab}>Department</span>
        <select value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value, owner: "", supervisor: "" }))} className={`${input} mt-1`}>
          {departments.map((d) => (
            <option key={d} value={d} className="bg-white text-black">{d}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={lab}>Progress</span>
        <span className="mt-1 block"><StatusSelect value={form.status} onChange={(v) => set("status", v)} label="Progress" /></span>
      </label>
      <label>
        <span className={lab}>Deadline</span>
        <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={`${input} mt-1 [color-scheme:dark]`} />
      </label>
      <label>
        <span className={lab}>Owner</span>
        <span className="mt-1 block"><PersonSelect value={form.owner} options={people} onChange={(v) => set("owner", v)} label="Owner" /></span>
      </label>
      <label>
        <span className={lab}>Supervisor</span>
        <span className="mt-1 block"><PersonSelect value={form.supervisor} options={people} onChange={(v) => set("supervisor", v)} label="Supervisor" /></span>
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy || !form.title.trim()} className={`${primary} disabled:opacity-40`}>{busy ? "Adding…" : "Add"}</button>
        <button type="button" onClick={onCancel} className={ghost}>Cancel</button>
      </div>
    </form>
  );
}

// ---------- Owners and supervisors (Executive) ----------

function LeadersPanel({ departments, leaders, teamNames, onSave, onClose }) {
  const [dept, setDept] = useState(departments[0]);
  const [picked, setPicked] = useState(leaders[departments[0]] || []);
  const [saving, setSaving] = useState(false);
  const choose = (d) => {
    setDept(d);
    setPicked(leaders[d] || []);
  };
  const names = [...new Set([...(leaders[dept] || []), ...teamNames])];
  const toggle = (n) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  return (
    <div className="mt-4 rounded-sm border border-[#d4af37]/60 bg-[#2a0101] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">Owners and supervisors</p>
          <p className="text-sm text-white/65">Who appears in the Owner and Supervisor dropdowns for each department’s tasks.</p>
        </div>
        <button type="button" onClick={onClose} className={ghost}>Done</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-1" role="tablist" aria-label="Department">
        {departments.map((d) => (
          <button key={d} type="button" role="tab" aria-selected={d === dept} onClick={() => choose(d)}
            className={`${btn} h-8 ${d === dept ? "bg-white text-[#2a0101]" : "border border-white/20 text-white/75 hover:bg-white/10"}`}>
            {d}
          </button>
        ))}
      </div>
      <fieldset className="mt-4">
        <legend className="sr-only">People who can own or supervise {dept} tasks</legend>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
          {names.map((n) => (
            <label key={n} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={picked.includes(n)} onChange={() => toggle(n)} className="h-4 w-4 accent-[#d4af37]" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" disabled={saving} onClick={async () => { setSaving(true); await onSave(dept, picked); setSaving(false); }} className={`${primary} mt-4`}>
        {saving ? "Saving…" : `Save for ${dept}`}
      </button>
    </div>
  );
}

// ---------- The board ----------

export default function TaskBoard({ base, initial, departments, homeDept, myNames, teamNames }) {
  const [tasks, setTasks] = useState(initial.tasks);
  const [leaders, setLeaders] = useState(initial.leaders);
  const myDepts = initial.myDepts;
  const exec = initial.exec;

  const [dept, setDept] = useState(homeDept);
  const [statusFilter, setStatusFilter] = useState("open");
  const [who, setWho] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ by: "status", dir: 1 });
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  const [settings, setSettings] = useState(false);
  const [saving, setSaving] = useState({}); // id → "saving" | "saved" | error text
  const [message, setMessage] = useState("");
  const pending = useRef(0);

  const canEdit = (d) => exec || myDepts.includes(d);

  const call = async (body) => {
    const res = await fetch("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      window.location.href = base || "/";
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "That couldn’t be saved. Try again.");
    return data;
  };

  const refresh = async () => {
    if (pending.current > 0) return;
    const res = await fetch("/api/admin/tasks", { cache: "no-store" });
    if (res.status === 401) return;
    if (!res.ok) return;
    const data = await res.json();
    if (pending.current > 0) return;
    setTasks(data.tasks);
    setLeaders(data.leaders);
  };
  usePoll(refresh, 30000);

  const flash = (id, state) => {
    setSaving((s) => ({ ...s, [id]: state }));
    if (state === "saved") setTimeout(() => setSaving((s) => (s[id] === "saved" ? { ...s, [id]: undefined } : s)), 1800);
  };

  const update = async (task, changes, closeAfter = false) => {
    const before = task;
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, ...changes } : t)));
    flash(task.id, "saving");
    pending.current++;
    try {
      const data = await call({ action: "update", id: task.id, changes });
      if (data) setTasks((ts) => ts.map((t) => (t.id === task.id ? data.task : t)));
      flash(task.id, "saved");
      if (closeAfter) setOpen(null);
    } catch (err) {
      setTasks((ts) => ts.map((t) => (t.id === task.id ? before : t)));
      flash(task.id, err.message);
    } finally {
      pending.current--;
    }
  };

  const create = async (form) => {
    try {
      const data = await call({ action: "create", task: form });
      if (!data) return false;
      setTasks((ts) => [data.task, ...ts]);
      flash(data.task.id, "saved");
      setMessage(`Added ${data.task.id}.`);
      if (dept !== "all" && dept !== data.task.dept) setDept(data.task.dept);
      return true;
    } catch (err) {
      setMessage(err.message);
      return false;
    }
  };

  const remove = async (task) => {
    try {
      await call({ action: "delete", id: task.id });
      setTasks((ts) => ts.filter((t) => t.id !== task.id));
      setOpen(null);
      setMessage(`Deleted ${task.id}.`);
    } catch (err) {
      flash(task.id, err.message);
    }
  };

  const saveLeaders = async (d, names) => {
    try {
      const data = await call({ action: "leaders", dept: d, names });
      if (data) setLeaders((l) => ({ ...l, [d]: data.names }));
      setMessage(`Saved the owners and supervisors for ${d}.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // ----- Filtering and sorting -----
  const inDept = dept === "all" ? tasks : tasks.filter((t) => t.dept === dept);
  const counts = {
    attention: inDept.filter(needsAttention).length,
    improve: inDept.filter((t) => t.status === "improve").length,
    review: inDept.filter((t) => t.status === "review").length,
    in_progress: inDept.filter((t) => t.status === "in_progress" && !isLate(t)).length,
    complete: inDept.filter((t) => t.status === "complete").length,
  };

  const owners = useMemo(() => [...new Set(tasks.map((t) => t.owner).filter(Boolean))].sort(), [tasks]);

  const shown = useMemo(() => {
    const words = plain(q).split(" ").filter(Boolean);
    let list = inDept.filter((t) => {
      if (statusFilter === "open" && t.status === "complete") return false;
      if (statusFilter === "attention" && !needsAttention(t)) return false;
      if (STATUS[statusFilter] && t.status !== statusFilter) return false;
      if (who === "me" && !involves(t, myNames)) return false;
      if (who && who !== "me" && !sameName(t.owner, who) && !String(t.owner).includes(who)) return false;
      if (words.length) {
        const hay = plain([t.id, t.title, t.notes, t.owner, t.supervisor, t.unit, t.dept].join(" "));
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    const rankStatus = (t) => (needsAttention(t) ? 0 : ORDER.indexOf(t.status));
    const cmp = {
      status: (a, b) => rankStatus(a) - rankStatus(b) || String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")),
      deadline: (a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")) || String(a.time).localeCompare(String(b.time)),
      id: (a, b) => a.id.localeCompare(b.id, "en", { numeric: true }),
      title: (a, b) => a.title.localeCompare(b.title),
      owner: (a, b) => String(a.owner || "~").localeCompare(String(b.owner || "~")),
      supervisor: (a, b) => String(a.supervisor || "~").localeCompare(String(b.supervisor || "~")),
      dept: (a, b) => a.dept.localeCompare(b.dept),
      updated: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    }[sort.by];
    return [...list].sort((a, b) => cmp(a, b) * sort.dir);
  }, [inDept, statusFilter, who, q, sort, myNames]);

  const Th = ({ by, children, className = "" }) => (
    <th scope="col" className={`px-3 py-2 text-left font-semibold ${className}`} aria-sort={sort.by === by ? (sort.dir > 0 ? "ascending" : "descending") : undefined}>
      <button type="button" onClick={() => setSort((s) => ({ by, dir: s.by === by ? -s.dir : 1 }))} className="inline-flex items-center gap-1 hover:text-white">
        {children}
        <span aria-hidden="true" className={sort.by === by ? "text-[#d4af37]" : "text-white/25"}>{sort.by === by && sort.dir < 0 ? "▲" : "▼"}</span>
      </button>
    </th>
  );

  const openCount = (d) => (d === "all" ? tasks : tasks.filter((t) => t.dept === d)).filter((t) => t.status !== "complete").length;
  const showDeptCol = dept === "all";

  const kpis = [
    ["attention", "Overdue", counts.attention, "text-[#f3c4c4]"],
    ["improve", "Needs improvement", counts.improve, "text-[#f2d48b]"],
    ["review", "Ready for review", counts.review, "text-[#c9daf4]"],
    ["in_progress", "In progress", counts.in_progress, "text-white"],
    ["complete", "Complete", counts.complete, "text-[#c7e6c2]"],
  ];

  return (
    <div className="[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]">
      {/* Departments */}
      <nav aria-label="Departments" className="-mx-1 flex gap-1 overflow-x-auto border-b border-white/15 px-1">
        {[...departments, "all"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => { setDept(d); setOpen(null); }}
            aria-current={dept === d ? "page" : undefined}
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm ${dept === d ? "border-[#d4af37] font-semibold text-white" : "border-transparent text-white/60 hover:text-white"}`}
          >
            {d === "all" ? "All departments" : d}
            <span className={`rounded-full px-1.5 text-xs tabular-nums ${dept === d ? "bg-[#d4af37] text-[#2a0101]" : "bg-white/10 text-white/70"}`}>{openCount(d)}</span>
          </button>
        ))}
      </nav>

      {/* Summary: click to filter */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map(([id, labelText, n, color]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusFilter((f) => (f === id ? "open" : id))}
            aria-pressed={statusFilter === id}
            className={`rounded-sm border px-3 py-2 text-left transition-colors ${statusFilter === id ? "border-[#d4af37] bg-white/10" : "border-white/15 bg-[#2a0101] hover:border-white/40"}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/55">{labelText}</span>
            <span className={`block text-2xl font-bold tabular-nums ${color}`}>{n}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="min-w-[12rem] flex-1">
          <span className="sr-only">Search tasks</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, people, IDs…" className={input} />
        </label>
        <label>
          <span className="sr-only">Progress</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${input} w-auto`}>
            <option value="open" className="bg-white text-black">All open tasks</option>
            <option value="all" className="bg-white text-black">Everything, including complete</option>
            <option value="attention" className="bg-white text-black">Overdue (incl. past deadline)</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id} className="bg-white text-black">{s.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Person</span>
          <select value={who} onChange={(e) => setWho(e.target.value)} className={`${input} w-auto`}>
            <option value="" className="bg-white text-black">Anyone</option>
            <option value="me" className="bg-white text-black">My tasks (owner or supervisor)</option>
            {owners.map((o) => (
              <option key={o} value={o} className="bg-white text-black">{o}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          {(exec || myDepts.length > 0) && (
            <button type="button" onClick={() => { setAdding((a) => !a); setSettings(false); }} className={primary} aria-expanded={adding}>
              + New task
            </button>
          )}
          <a href="/api/admin/tasks?format=csv" className={ghost} download>Download</a>
          {exec && (
            <button type="button" onClick={() => { setSettings((s) => !s); setAdding(false); }} className={ghost} aria-expanded={settings}>
              Owner lists
            </button>
          )}
        </div>
      </div>

      {adding && (
        <NewTask
          departments={exec ? departments : departments.filter((d) => myDepts.includes(d))}
          defaultDept={dept !== "all" && canEdit(dept) ? dept : (exec ? departments : myDepts)[0] || departments[0]}
          leaders={leaders}
          onCreate={create}
          onCancel={() => setAdding(false)}
        />
      )}
      {settings && <LeadersPanel departments={departments} leaders={leaders} teamNames={teamNames} onSave={saveLeaders} onClose={() => setSettings(false)} />}

      <p role="status" className="mt-3 min-h-5 text-sm text-white/70">{message}</p>

      {/* Table (tablets and up) */}
      <div className="mt-1 hidden overflow-x-auto rounded-sm border border-white/15 md:block">
        <table className="w-full min-w-[60rem] border-collapse text-sm">
          <caption className="sr-only">Tasks{dept === "all" ? "" : ` for ${dept}`}</caption>
          <thead className="bg-[#2a0101] text-xs uppercase tracking-wider text-white/60">
            <tr className="border-b border-white/15">
              <Th by="id" className="w-[5.5rem]">ID</Th>
              <Th by="title">Task</Th>
              {showDeptCol && <Th by="dept" className="w-[10rem]">Department</Th>}
              <Th by="status" className="w-[11rem]">Progress</Th>
              <Th by="deadline" className="w-[9.5rem]">Deadline</Th>
              <Th by="owner" className="w-[11rem]">Owner</Th>
              <Th by="supervisor" className="w-[11rem]">Supervisor</Th>
              <th scope="col" className="w-[4.5rem] px-3 py-2"><span className="sr-only">Details</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => {
              const editable = canEdit(t.dept);
              const people = leaders[t.dept] || [];
              const state = saving[t.id];
              return (
                <FragmentRow key={t.id} open={open === t.id} colSpan={showDeptCol ? 8 : 7}
                  details={<Details key={`${t.id}-${t.updatedAt}`} task={t} editable={editable} departments={exec ? departments : departments.filter((d) => myDepts.includes(d) || d === t.dept)} onSave={(f) => update(t, f, true)} onDelete={() => remove(t)} onClose={() => setOpen(null)} />}
                >
                  <tr className={`border-b border-white/10 align-middle ${open === t.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"} ${t.status === "complete" ? "text-white/60" : ""}`}>
                    <td className="px-3 py-2 font-mono text-xs text-white/55">{t.id}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => setOpen(open === t.id ? null : t.id)} className={`text-left leading-snug hover:text-[#d4af37] ${t.status === "complete" ? "" : "font-semibold"}`}>
                        {t.title}
                      </button>
                      <span className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-white/50">
                        {isLate(t) && t.status !== "overdue" && <span className="font-semibold text-[#f3c4c4]">Past deadline</span>}
                        {t.unit && <span>{t.unit}</span>}
                        {t.notes && <span title={t.notes}>Notes</span>}
                        {t.link && <a href={t.link} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] hover:underline">Deliverable ↗</a>}
                        {state && state !== "saving" && state !== "saved" && <span role="alert" className="text-[#f3c4c4]">{state}</span>}
                        {state === "saving" && <span>Saving…</span>}
                        {state === "saved" && <span className="text-[#c7e6c2]">Saved</span>}
                      </span>
                    </td>
                    {showDeptCol && <td className="px-3 py-2 text-white/75">{t.dept}</td>}
                    <td className="px-3 py-2">
                      <StatusSelect value={t.status} disabled={!editable} label={`Progress of ${t.id}`} onChange={(v) => update(t, { status: v })} />
                    </td>
                    <td className="px-3 py-2">
                      <DeadlineInput task={t} disabled={!editable} label={`Deadline of ${t.id}`} onChange={(v) => update(t, { deadline: v })} />
                    </td>
                    <td className="px-3 py-2">
                      <PersonSelect value={t.owner} options={people} disabled={!editable} label={`Owner of ${t.id}`} onChange={(v) => update(t, { owner: v })} />
                    </td>
                    <td className="px-3 py-2">
                      <PersonSelect value={t.supervisor} options={people} disabled={!editable} label={`Supervisor of ${t.id}`} onChange={(v) => update(t, { supervisor: v })} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => setOpen(open === t.id ? null : t.id)} aria-expanded={open === t.id} className="text-xs font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline">
                        {open === t.id ? "Close" : editable ? "Edit" : "View"}
                      </button>
                    </td>
                  </tr>
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
        {!shown.length && <Empty filtered={tasks.length > 0} />}
      </div>

      {/* Cards (phones) */}
      <ul className="mt-1 space-y-2 md:hidden">
        {shown.map((t) => {
          const editable = canEdit(t.dept);
          const people = leaders[t.dept] || [];
          const state = saving[t.id];
          return (
            <li key={t.id} className="rounded-sm border border-white/15 bg-[#2a0101]">
              <div className="p-3">
                <button type="button" onClick={() => setOpen(open === t.id ? null : t.id)} aria-expanded={open === t.id} className={`text-left leading-snug ${t.status === "complete" ? "text-white/60" : "font-semibold"}`}>
                  {t.title}
                </button>
                <p className="mt-0.5 text-xs text-white/50">
                  {[t.id, dept === "all" ? t.dept : "", t.unit].filter(Boolean).join(" · ")}
                  {isLate(t) && t.status !== "overdue" && <span className="font-semibold text-[#f3c4c4]"> · Past deadline</span>}
                  {state === "saving" && " · Saving…"}
                  {state === "saved" && <span className="text-[#c7e6c2]"> · Saved</span>}
                </p>
                {state && state !== "saving" && state !== "saved" && <p role="alert" className="mt-1 text-xs text-[#f3c4c4]">{state}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <StatusSelect value={t.status} disabled={!editable} label={`Progress of ${t.id}`} onChange={(v) => update(t, { status: v })} />
                  <DeadlineInput task={t} disabled={!editable} label={`Deadline of ${t.id}`} onChange={(v) => update(t, { deadline: v })} />
                  <label className="text-[11px] uppercase tracking-wider text-white/50">
                    Owner
                    <PersonSelect value={t.owner} options={people} disabled={!editable} label={`Owner of ${t.id}`} onChange={(v) => update(t, { owner: v })} />
                  </label>
                  <label className="text-[11px] uppercase tracking-wider text-white/50">
                    Supervisor
                    <PersonSelect value={t.supervisor} options={people} disabled={!editable} label={`Supervisor of ${t.id}`} onChange={(v) => update(t, { supervisor: v })} />
                  </label>
                </div>
              </div>
              {open === t.id && (
                <Details key={`${t.id}-${t.updatedAt}`} task={t} editable={editable} departments={exec ? departments : departments.filter((d) => myDepts.includes(d) || d === t.dept)} onSave={(f) => update(t, f, true)} onDelete={() => remove(t)} onClose={() => setOpen(null)} />
              )}
            </li>
          );
        })}
        {!shown.length && <Empty filtered={tasks.length > 0} />}
      </ul>

      <p className="mt-3 text-xs text-white/65">
        {shown.length} of {inDept.length} task{inDept.length === 1 ? "" : "s"} shown. Changes save straight away; the list refreshes every 30 seconds.
        {!exec && myDepts.length > 0 && ` You can change tasks in ${myDepts.join(", ")}.`}
      </p>
    </div>
  );
}

function FragmentRow({ children, open, details, colSpan }) {
  return (
    <>
      {children}
      {open && (
        <tr>
          <td colSpan={colSpan} className="p-0">{details}</td>
        </tr>
      )}
    </>
  );
}

function Empty({ filtered }) {
  return <p className="p-6 text-center text-sm text-white/60">{filtered ? "No tasks match these filters." : "No tasks yet. Add the first one with “+ New task”."}</p>;
}

"use client";

// The team directory under the task board. The Executive can add, edit and
// remove people; everyone can edit their own WhatsApp number and email.
// Contact details for other departments are never sent to the browser.
import { useState } from "react";
import { byRank } from "@/lib/team_rank";
import { whatsapp } from "@/lib/dashboard";

const input =
  "h-9 w-full rounded-sm border border-white/25 bg-[#1f0101] px-2 text-sm text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none";
const btn = "inline-flex h-9 items-center justify-center rounded-sm px-3 text-sm font-semibold whitespace-nowrap";
const primary = `${btn} bg-[#d4af37] text-[#2a0101] hover:bg-white`;
const ghost = `${btn} border border-white/25 text-white hover:bg-white/10`;
const lab = "block text-xs font-semibold uppercase tracking-wider text-white/60";

function Contact({ p }) {
  const w = whatsapp(p.whatsapp);
  if (!w && !p.email) return null;
  return (
    <span className="mt-0.5 flex flex-wrap gap-x-4 text-sm">
      {w &&
        (w.href ? (
          <a href={w.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center tabular-nums text-[#d4af37] hover:underline">
            {w.text}
          </a>
        ) : (
          <span className="tabular-nums">{w.text}</span>
        ))}
      {p.email && (
        <a href={`mailto:${p.email}`} className="inline-flex min-h-6 items-center text-[#d4af37] [overflow-wrap:anywhere] hover:underline">
          {p.email}
        </a>
      )}
    </span>
  );
}

function MemberForm({ member, exec, departments, onSave, onCancel, onRemove }) {
  const [f, setF] = useState({
    name: member?.name || "", role: member?.role || "", unit: member?.unit || "",
    departments: member?.departments || [], whatsapp: member?.whatsapp || "", email: member?.email || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (d) => setF((x) => ({ ...x, departments: x.departments.includes(d) ? x.departments.filter((y) => y !== d) : [...x.departments, d] }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const err = await onSave({ ...(member?.id ? { id: member.id } : {}), ...f });
    setBusy(false);
    if (err) setError(err);
  };
  return (
    <form onSubmit={submit} className="mt-2 grid gap-3 rounded-sm border border-[#d4af37]/50 bg-[#1f0101] p-3 sm:grid-cols-2">
      {exec && (
        <>
          <label>
            <span className={lab}>Name</span>
            <input value={f.name} onChange={set("name")} required maxLength={80} className={`${input} mt-1`} />
          </label>
          <label>
            <span className={lab}>Role</span>
            <input value={f.role} onChange={set("role")} maxLength={160} placeholder="e.g. Director of Finance" className={`${input} mt-1`} />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className={lab}>Departments</legend>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {departments.map((d) => (
                <label key={d} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.departments.includes(d)} onChange={() => toggle(d)} className="h-4 w-4 accent-[#d4af37]" />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            <span className={lab}>Unit</span>
            <input value={f.unit} onChange={set("unit")} maxLength={80} placeholder="e.g. Invitations" className={`${input} mt-1`} />
          </label>
          <span className="hidden sm:block" />
        </>
      )}
      <label>
        <span className={lab}>WhatsApp number</span>
        <input value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" maxLength={30} placeholder="07… or +49…" className={`${input} mt-1`} />
      </label>
      <label>
        <span className={lab}>Email</span>
        <input type="email" value={f.email} onChange={set("email")} maxLength={120} className={`${input} mt-1`} />
      </label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : member ? "Save" : "Add person"}</button>
        <button type="button" onClick={onCancel} className={ghost}>Cancel</button>
        {error && <span role="alert" className="text-sm text-[#f3c4c4]">{error}</span>}
        {exec && member && onRemove && (
          <span className="ml-auto">
            {confirming ? (
              <span className="flex items-center gap-2 text-sm">
                Remove {member.name}?
                <button type="button" onClick={onRemove} className={`${btn} bg-[#f3c4c4] text-[#4a0606]`}>Remove</button>
                <button type="button" onClick={() => setConfirming(false)} className={ghost}>Keep</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className={`${btn} text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>Remove from team</button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}

export default function TeamDirectory({ base, initial, departments, exec, myIds, note }) {
  const [team, setTeam] = useState(initial);
  const [editing, setEditing] = useState(null); // member id, or "new"
  const [message, setMessage] = useState("");

  const call = async (body) => {
    const res = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      window.location.href = base || "/";
      return { error: "Please sign in again." };
    }
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { error: data.error || "That couldn’t be saved." };
  };

  const save = async (member) => {
    const data = await call({ action: "save", member });
    if (data.error) return data.error;
    setTeam((t) => (t.some((p) => p.id === data.member.id) ? t.map((p) => (p.id === data.member.id ? data.member : p)) : [...t, data.member]));
    setEditing(null);
    setMessage(`Saved ${data.member.name}.`);
    return null;
  };
  const remove = async (m) => {
    const data = await call({ action: "delete", id: m.id });
    if (data.error) return setMessage(data.error);
    setTeam((t) => t.filter((p) => p.id !== m.id));
    setEditing(null);
    setMessage(`Removed ${m.name}.`);
  };

  const groups = departments
    .map((d) => ({ d, people: byRank(team.filter((p) => p.departments.includes(d)), d, departments) }))
    .filter((g) => g.people.length);
  const elsewhere = team.filter((p) => !p.departments.some((d) => departments.includes(d)));
  if (elsewhere.length) groups.push({ d: "No department", people: elsewhere });

  return (
    <div className="[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-sm text-white/75">{note}</p>
        {exec && (
          <button type="button" onClick={() => setEditing(editing === "new" ? null : "new")} aria-expanded={editing === "new"} className={primary}>
            + Add person
          </button>
        )}
      </div>
      {editing === "new" && <MemberForm exec departments={departments} onSave={save} onCancel={() => setEditing(null)} />}
      <p role="status" className="mt-2 min-h-5 text-sm text-white/70">{message}</p>

      <div className="mt-2 grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ d, people }) => (
          <section key={d} aria-label={d}>
            <h3 className="border-b border-[#d4af37]/50 pb-1 text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
              {d} <span className="text-white/60">· {people.length}</span>
            </h3>
            <ul>
              {people.map((p) => {
                const mine = myIds.includes(p.id);
                const canEdit = exec || mine;
                const key = `${d}-${p.id}`;
                return (
                  <li key={key} className="border-b border-white/10 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-semibold">{p.name}</span>
                        {mine && <span className="ml-2 rounded-full bg-white/10 px-1.5 text-[11px] text-white/75">You</span>}
                        {(p.role || p.unit) && <span className="block text-sm text-white/65">{[p.role, p.unit].filter(Boolean).join(" · ")}</span>}
                        <Contact p={p} />
                      </div>
                      {canEdit && (
                        <button type="button" onClick={() => setEditing(editing === key ? null : key)} aria-expanded={editing === key} className="shrink-0 text-xs font-semibold text-white/65 hover:text-white hover:underline">
                          {editing === key ? "Close" : "Edit"}
                          <span className="sr-only"> {p.name}</span>
                        </button>
                      )}
                    </div>
                    {editing === key && (
                      <MemberForm member={p} exec={exec} departments={departments} onSave={save} onCancel={() => setEditing(null)} onRemove={() => remove(p)} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {!team.length && <p className="text-white/70">No one in the team directory yet.{exec ? " Add people with “+ Add person”." : ""}</p>}
    </div>
  );
}

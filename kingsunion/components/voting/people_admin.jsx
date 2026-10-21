"use client";

import { useState } from "react";
import { when, smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-12 px-5 text-base bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const STATUS = { active: "Active", invited: "Hasn’t set a password yet", disabled: "Turned off" };

async function call(url, method, body, base) {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  if (res.status === 401) {
    window.location.href = base || "/";
    throw new Error("Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
  return data;
}

// A setup link to pass on, with a copy button.
function LinkBox({ link, name, emailed, onDone }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      window.prompt("Copy this link:", link);
    }
  }
  return (
    <div role="status" className="border border-[#7fd1a8]/60 p-4 sm:p-5">
      <p className="font-bold">Setup link for {name}</p>
      <p className="mt-1 text-sm text-white/70">
        {emailed ? "We’ve emailed it to them. " : ""}Send them this link (e.g. on WhatsApp) to choose their own password. It works once and lasts 7 days.
      </p>
      <p className="mt-3 break-all border border-white/15 bg-[#2a0101] px-3 py-2 text-sm">{link}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={primary}>{copied ? "Copied ✓" : "Copy link"}</button>
        <button type="button" onClick={onDone} className={outline}>Done</button>
      </div>
    </div>
  );
}

export default function PeopleAdmin({ base, initial, shared: sharedInitial, teams, meId, meIsSuper = false }) {
  const [people, setPeople] = useState(initial);
  const [shared, setShared] = useState(sharedInitial);
  const [form, setForm] = useState({ name: "", email: "", team: "events" });
  const [link, setLink] = useState(null); // { link, name, emailed }
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const teamLabel = Object.fromEntries(teams.map((t) => [t.key, t.label]));
  const assignable = teams.filter((t) => t.key !== "super"); // super admins are set in Vercel

  async function run(name, fn) {
    setBusy(name);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }
  const replace = (p) => setPeople((list) => list.map((x) => (x.id === p.id ? p : x)));

  const add = (e) => {
    e.preventDefault();
    run("add", async () => {
      const data = await call("/api/admin/people", "POST", { action: "add", ...form }, base);
      setPeople((list) => [...list, data.person].sort((a, b) => a.name.localeCompare(b.name)));
      setLink({ link: data.link, name: data.person.name, emailed: data.emailed });
      setForm({ name: "", email: "", team: form.team });
    });
  };

  const patch = (p, body, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    run(`${p.id}`, async () => {
      const data = await call(`/api/admin/people/${p.id}`, "PATCH", body, base);
      replace(data.person);
      if (data.link) setLink({ link: data.link, name: data.person.name, emailed: data.emailed });
    });
  };

  const remove = (p) => {
    if (!window.confirm(`Remove ${p.name}’s login completely? (Their past activity stays in the log.)`)) return;
    run(`${p.id}`, async () => {
      await call(`/api/admin/people/${p.id}`, "DELETE", null, base);
      setPeople((list) => list.filter((x) => x.id !== p.id));
    });
  };

  const toggleShared = () => {
    const on = !shared;
    if (!on && !window.confirm("Switch the shared committee password off? From then on, everyone must use their own login.")) return;
    run("shared", async () => {
      await call("/api/admin/people", "POST", { action: "shared", on }, base);
      setShared(on);
    });
  };

  return (
    <div className="space-y-10">
      {link && <LinkBox {...link} onDone={() => setLink(null)} />}
      {error && (
        <p role="alert" className="text-[#f3c4c4]">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Logins ({people.length})</h2>
        {people.length === 0 ? (
          <p className="mt-3 border border-dashed border-[#d4af37]/60 px-6 py-8 text-center text-white/70">No one has their own login yet. Add the committee below.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
            {people.map((p) => (
              <li key={p.id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-bold">
                    {p.name} {p.id === meId && <span className="text-sm font-normal text-white/55">(you)</span>}
                  </p>
                  <p className="text-sm text-white/60 break-all">{p.email}</p>
                  <p className={`mt-1 text-sm ${p.status === "active" ? "text-[#c9f0dc]" : p.status === "disabled" ? "text-[#f3c4c4]" : "text-[#d4af37]"}`}>
                    {STATUS[p.status]}
                    {p.lastLogin ? <span className="text-white/45"> · last signed in {when(p.lastLogin)}</span> : null}
                  </p>
                </div>
                {p.superAdmin && !meIsSuper ? (
                  <p className="text-sm text-[#d4af37]">Super admin · only another super admin can change this login</p>
                ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {p.superAdmin ? (
                    <span className="inline-flex min-h-11 items-center border border-[#d4af37] px-3 text-sm font-bold text-[#d4af37]">Super admin (set in Vercel)</span>
                  ) : (
                  <>
                  <label className="sr-only" htmlFor={`team-${p.id}`}>Team for {p.name}</label>
                  <select
                    id={`team-${p.id}`}
                    value={p.team}
                    disabled={!!busy}
                    onChange={(e) => patch(p, { team: e.target.value }, `Move ${p.name} to ${teamLabel[e.target.value]}?`)}
                    className={`${field} w-auto min-h-11`}
                  >
                    {assignable.map((t) => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                  </>
                  )}
                  <button type="button" disabled={!!busy} onClick={() => patch(p, { resetPassword: true }, `Make a new setup link for ${p.name}? Their current password will stop working.`)} className={outline}>
                    {p.status === "invited" ? "New setup link" : "Reset password"}
                  </button>
                  {p.status === "disabled" ? (
                    <button type="button" disabled={!!busy} onClick={() => patch(p, { disabled: false })} className={outline}>Turn back on</button>
                  ) : (
                    <button type="button" disabled={!!busy} onClick={() => patch(p, { disabled: true }, `Turn off ${p.name}’s login? They’ll be signed out straight away.`)} className={danger}>Turn off</button>
                  )}
                  <button type="button" disabled={!!busy} onClick={() => remove(p)} className={`${smallBtn} text-white/60 underline underline-offset-4 hover:text-white`}>
                    Remove
                  </button>
                </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-[#d4af37]/60 p-5 sm:p-6">
        <h2 className="title text-2xl font-bold">Add someone</h2>
        <form onSubmit={add} className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className={label}>Name</span>
            <input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>Email</span>
            <input required type="email" maxLength={160} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>Team</span>
            <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={field}>
              {assignable.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-3">
            <button type="submit" disabled={!!busy} className={primary}>{busy === "add" ? "Adding…" : "Add and get their setup link"}</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">What each team can see</h2>
        <dl className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.key} className="border border-white/15 p-4">
              <dt className="font-bold">{t.label}</dt>
              <dd className="mt-1 text-sm text-white/70">{t.sees.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-white/15 pt-8">
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Shared committee password</h2>
        <p className="mt-2 max-w-2xl text-white/75">
          {shared
            ? "The old shared password still works and signs in as the Executive. Once everyone has their own login, switch it off so only individual logins work."
            : "Switched off: everyone signs in with their own email and password."}
        </p>
        <button type="button" disabled={!!busy} onClick={toggleShared} className={`${shared ? danger : outline} mt-4`}>
          {shared ? "Switch the shared password off" : "Switch it back on"}
        </button>
      </section>
    </div>
  );
}

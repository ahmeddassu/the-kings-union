"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-11 px-5 bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const h2 = "title text-2xl sm:text-3xl font-bold";

function signIn(base) {
  window.location.href = base || "/";
}

async function call(url, method, body, base) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 401) {
    signIn(base);
    throw new Error("Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
  return data;
}

function shortDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function download(people) {
  const rows = [["Name", "Email", "Events this year", "Events in total", "Last came"], ...people.map((p) => [p.name, p.email, p.year, p.total, p.last])];
  const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "kings-union-regulars.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function AttendanceAdmin({ base, initial, settings, events }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [slug, setSlug] = useState(events[0]?.slug || "");
  const [threshold, setThreshold] = useState(settings.threshold);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const { events: imported, people } = initial;
  const regulars = people.filter((p) => p.year >= settings.threshold);
  const q = query.trim().toLowerCase();
  const found = q ? people.filter((p) => p.email.includes(q) || p.name.toLowerCase().includes(q)) : [];

  async function run(name, fn) {
    setBusy(name);
    setError("");
    setNote("");
    try {
      await fn();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const upload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    run("upload", async () => {
      if (!slug) throw new Error("Please choose the event first.");
      if (file.size > 3 * 1024 * 1024) throw new Error("That file is too big.");
      const csv = await file.text();
      const { entry } = await call("/api/admin/attendance", "POST", { slug, csv }, base);
      setNote(`Saved: ${entry.checkedIn} checked in at ${entry.title}.`);
    });
  };

  const saveThreshold = (e) => {
    e.preventDefault();
    run("threshold", async () => {
      await call("/api/admin/attendance", "PUT", { threshold }, base);
      setNote("Saved.");
    });
  };

  const remove = (d) => {
    if (!window.confirm(`Delete the attendance for ${d.title}?`)) return;
    run(`del-${d.slug}`, async () => {
      await call(`/api/admin/attendance?slug=${encodeURIComponent(d.slug)}`, "DELETE", null, base);
      setNote("Deleted.");
    });
  };

  const removeAll = () => {
    if (!window.confirm("Delete every attendance record? This can’t be undone.")) return;
    run("all", async () => {
      await call("/api/admin/attendance?all=1", "DELETE", null, base);
      setNote("All attendance records deleted.");
    });
  };

  const copy = () =>
    run("copy", async () => {
      await navigator.clipboard.writeText(regulars.map((p) => p.email).join(", "));
      setNote(`Copied ${regulars.length} email address${regulars.length === 1 ? "" : "es"}.`);
    });

  return (
    <div className="space-y-12">
      <p role="status" aria-live="polite" className="min-h-6">
        {error ? <span className="text-[#f3c4c4]">{error}</span> : note ? <span className="text-[#d4af37]">{note}</span> : null}
      </p>

      {/* Upload */}
      <section aria-labelledby="att-upload">
        <h2 id="att-upload" className={h2}>Upload check-ins</h2>
        {events.length ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end max-w-3xl">
            <label className="block" htmlFor="att-event">
              <span className={label}>Event</span>
              <select id="att-event" value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
                {events.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {imported.some((d) => d.slug === e.slug) ? "✓ " : ""}
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${primary} cursor-pointer`}>
              {busy === "upload" ? "Uploading…" : "Choose Luma CSV…"}
              <input type="file" accept=".csv,text/csv" onChange={upload} className="sr-only" disabled={Boolean(busy)} />
            </label>
          </div>
        ) : (
          <p className="mt-3 text-white/70">Events appear here once they’ve happened.</p>
        )}
        <p className="mt-2 text-sm text-white/55">Uploading again for the same event replaces what was there.</p>
      </section>

      {/* Regulars */}
      <section aria-labelledby="att-regulars">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="att-regulars" className={h2}>Regulars</h2>
            <p className="mt-1 text-white/70">
              People who have come to {settings.threshold} or more events this academic year (since {shortDate(initial.yearStart)}).
            </p>
          </div>
          <form onSubmit={saveThreshold} className="flex items-end gap-2">
            <label htmlFor="att-threshold">
              <span className={label}>A regular comes to</span>
              <input
                id="att-threshold"
                type="number"
                min={2}
                max={50}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className={`${field} w-24`}
              />
            </label>
            <button type="submit" disabled={Boolean(busy)} className={outline}>Save</button>
          </form>
        </div>

        {regulars.length ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={copy} disabled={Boolean(busy)} className={primary}>
                Copy their emails
              </button>
              <button type="button" onClick={() => download(regulars)} className={outline}>
                Download as CSV
              </button>
            </div>
            <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Regulars">
              <table className="w-full min-w-[36rem] text-left">
                <caption className="sr-only">Regulars this academic year</caption>
                <thead className="text-xs uppercase tracking-widest text-[#d4af37]">
                  <tr>
                    <th scope="col" className="py-2 pr-4">Name</th>
                    <th scope="col" className="py-2 pr-4">Email</th>
                    <th scope="col" className="py-2 pr-4 text-right">This year</th>
                    <th scope="col" className="py-2 pr-4 text-right">In total</th>
                    <th scope="col" className="py-2">Last came</th>
                  </tr>
                </thead>
                <tbody>
                  {regulars.map((p) => (
                    <tr key={p.email} className="border-t border-[#d4af37]/30">
                      <td className="py-2 pr-4">{p.name}</td>
                      <td className="py-2 pr-4 break-all text-white/80">{p.email}</td>
                      <td className="py-2 pr-4 text-right tabular-nums font-bold">{p.year}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{p.total}</td>
                      <td className="py-2 whitespace-nowrap">{shortDate(p.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-white/55">
              To give regulars priority, approve their requests first on Luma, or paste their emails into Luma’s
              “Invite guests” for a debate.
            </p>
          </>
        ) : (
          <p className="mt-4 text-white/70">
            {people.length ? `No one has come to ${settings.threshold} or more events this year yet.` : "Upload a guest list to get started."}
          </p>
        )}
      </section>

      {/* Look someone up */}
      {people.length > 0 && (
        <section aria-labelledby="att-lookup">
          <h2 id="att-lookup" className={h2}>Look someone up</h2>
          <p className="mt-1 text-white/70">Useful when approving a ticket request on Luma.</p>
          <label htmlFor="att-q" className="sr-only">Name or email</label>
          <input
            id="att-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email"
            className={`${field} mt-3 max-w-md`}
          />
          {q && (
            <ul className="mt-3 space-y-2" aria-live="polite">
              {found.slice(0, 20).map((p) => (
                <li key={p.email} className="border-t border-[#d4af37]/30 pt-2">
                  <strong>{p.name || p.email}</strong> <span className="text-white/60 break-all">{p.email}</span>
                  <span className="block text-sm text-white/75">
                    {p.year} this year · {p.total} in total · last came {shortDate(p.last)}
                    {p.year >= settings.threshold && <span className="ml-2 text-[#d4af37]">Regular</span>}
                  </span>
                </li>
              ))}
              {!found.length && <li className="text-white/60">No one by that name or email has been checked in.</li>}
            </ul>
          )}
        </section>
      )}

      {/* Events */}
      {imported.length > 0 && (
        <section aria-labelledby="att-events">
          <h2 id="att-events" className={h2}>Events uploaded</h2>
          <ul className="mt-4">
            {imported.map((d) => (
              <li key={d.slug} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d4af37]/30 py-3">
                <span>
                  <strong>{d.title}</strong>
                  <span className="block text-sm text-white/65">
                    {shortDate(d.date)} · {d.checkedIn} checked in of {d.registered} with tickets
                    {d.by ? ` · uploaded by ${d.by}` : ""}
                  </span>
                </span>
                <button type="button" onClick={() => remove(d)} disabled={Boolean(busy)} className={danger}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={removeAll} disabled={Boolean(busy)} className={`${danger} mt-6`}>
            Delete all attendance records
          </button>
        </section>
      )}
    </div>
  );
}

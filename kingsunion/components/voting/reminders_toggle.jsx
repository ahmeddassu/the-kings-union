"use client";

import { useState } from "react";
import { smallBtn } from "@/components/voting/inbox_actions";

const day = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

// Automatic day-before reminders: status, what's next, and an on/off switch.
export default function RemindersToggle({ base, initialOn, ready, upcoming, count }) {
  const [on, setOn] = useState(initialOn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/alerts/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on: !on }) });
      if (res.status === 401) return (window.location.href = base || "/");
      if (!res.ok) throw new Error("That didn’t work. Please try again.");
      setOn(!on);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border border-[#d4af37]/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="title text-2xl font-bold">Automatic reminders</h2>
          <p className="mt-2 text-white/75">
            The morning before each debate, everyone on the list ({count}) gets a short reminder with the motion, time,
            venue and a link to tickets. Each debate is only reminded once, and every email has an unsubscribe link.
          </p>
        </div>
        <span className={`inline-flex min-h-9 items-center px-3 text-sm font-bold uppercase tracking-widest ${on ? "bg-[#7fd1a8]/20 text-[#c9f0dc]" : "bg-white/10 text-white/70"}`}>
          {on ? "On" : "Off"}
        </span>
      </div>
      {!ready && <p className="mt-3 text-[#f3c4c4]">Email isn’t set up yet, so no reminders will go out until it is (see “Email everyone on the list” below).</p>}
      {on && upcoming.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-white/75">
          {upcoming.map((u) => (
            <li key={u.slug}>
              <strong className="text-white">“{u.title}”</strong>: reminder on the morning of {day(u.sendOn)}
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-[#f3c4c4]">{error}</p>}
      <button type="button" onClick={toggle} disabled={busy} className={`${smallBtn} mt-5 border border-[#d4af37]/70 text-white hover:bg-white/10`}>
        {busy ? "Saving…" : on ? "Switch reminders off" : "Switch reminders on"}
      </button>
    </section>
  );
}

"use client";
// MOCK-UP ONLY (not shipped): what joining a waitlist would look like.
import { useState } from "react";

export default function WaitlistBox({ title, compact = false }) {
  const [done, setDone] = useState(false);
  const field = "mt-1 h-12 w-full border border-[#d4af37]/60 bg-[#2a0101] px-3 text-base text-white placeholder:text-white/40 focus:border-[#d4af37] focus:outline-none";
  if (done)
    return (
      <div id="waitlist" className="mt-5 max-w-xl border border-[#d4af37] bg-[#2a0101] p-5" role="status">
        <p className="text-xs uppercase tracking-widest text-[#d4af37]">You’re on the waitlist</p>
        <p className="title mt-2 text-3xl font-bold">Number 14</p>
        <p className="mt-2 text-white/80">
          If a ticket comes up, we’ll email you a link to claim it. You’ll have two hours before it goes to the next person.
        </p>
        <p className="mt-3 text-sm text-white/60">Can’t make it after all? <span className="underline underline-offset-4">Leave the waitlist</span></p>
      </div>
    );
  return (
    <form id="waitlist" onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-5 scroll-mt-24 max-w-xl border border-[#d4af37] bg-[#2a0101] p-5">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Sold out · 13 people waiting</p>
      <p className="title mt-2 text-2xl font-bold">Join the waitlist</p>
      <p className="mt-2 text-white/80">Tickets are often returned before the night. We’ll offer them in the order people join.</p>
      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <label><span className="text-sm text-white/75">Name</span><input className={field} defaultValue="Ada Lovelace" /></label>
        <label><span className="text-sm text-white/75">Email</span><input className={field} type="email" defaultValue="ada.lovelace@kcl.ac.uk" /></label>
      </div>
      <button className="mt-4 min-h-12 w-full sm:w-auto bg-[#d4af37] px-8 text-lg font-bold text-[#3d0202] hover:bg-white">Join the waitlist</button>
      <p className="mt-3 text-xs text-white/60">We only use your email for this debate’s waitlist, then delete it.</p>
    </form>
  );
}

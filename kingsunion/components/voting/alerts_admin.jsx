"use client";

import { useState } from "react";
import { inboxRequest, when, smallBtn } from "@/components/voting/inbox_actions";

export default function AlertsAdmin({ base, initial }) {
  const [items, setItems] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const all = items.map((a) => a.email).join(", ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(all);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy these addresses:", all);
    }
  }

  async function remove(a) {
    if (!window.confirm(`Remove ${a.email} from ticket alerts?`)) return;
    setError("");
    try {
      const data = await inboxRequest("/api/admin/alerts", "DELETE", { email: a.email }, base);
      if (data) setItems((list) => list.filter((x) => x.email !== a.email));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} disabled={!items.length} className={`${smallBtn} bg-[#d4af37] text-[#3d0202] hover:bg-white`}>
          {copied ? "Copied ✓" : `Copy all ${items.length} addresses`}
        </button>
        <a href="/api/admin/alerts?format=csv" className={`${smallBtn} border border-[#d4af37]/60 hover:bg-white/10`}>
          Download spreadsheet (CSV)
        </a>
      </div>
      <p className="mt-3 text-sm text-white/60">
        The easiest way to email everyone is the box above. If you copy the addresses into your own email instead, put them in{" "}
        <strong>Bcc</strong> so people can’t see each other’s, and include a way to unsubscribe.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-[#f3c4c4]">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-6 border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">No sign-ups yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-[#d4af37]/30 border-y border-[#d4af37]/30">
          {items.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-bold break-all">{a.email}</p>
                <p className="text-sm text-white/60">
                  {a.name ? `${a.name} · ` : ""}
                  {when(a.createdAt)}
                </p>
              </div>
              <button type="button" onClick={() => remove(a)} className={`${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

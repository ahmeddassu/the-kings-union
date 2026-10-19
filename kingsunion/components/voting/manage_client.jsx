"use client";

import { useState } from "react";
import Results from "@/components/voting/results";
import StatusBadge from "@/components/voting/status_badge";
import usePoll from "@/components/voting/use_poll";

const btn = "inline-flex min-h-12 items-center justify-center px-5 text-base font-bold transition-colors disabled:opacity-50";
const primary = `${btn} bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${btn} border border-[#d4af37] text-white hover:bg-white/10`;
const danger = `${btn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;

export default function ManageClient({ base, initial, qrSvg, link }) {
  const [debate, setDebate] = useState(initial.debate);
  const [counts, setCounts] = useState(initial.counts);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    const res = await fetch(`/api/admin/debates/${debate.id}/live`, { cache: "no-store" });
    if (res.status === 401) return (window.location.href = base || "/");
    if (res.ok) {
      const data = await res.json();
      setDebate(data.debate);
      setCounts(data.counts);
    }
  };
  usePoll(refresh, 2000, debate.status === "open");

  async function act(action, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/debates/${debate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) return (window.location.href = base || "/");
      if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
      setDebate(data.debate);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${debate.title}” and all its votes? This can’t be undone.`)) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/debates/${debate.id}`, { method: "DELETE" });
    if (res.ok || res.status === 404) window.location.href = base || "/";
    else {
      setError("Couldn’t delete. Please try again.");
      setBusy("");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the voting link:", link);
    }
  }

  const s = debate.status;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={s} />
          {debate.hideResults && s !== "closed" && (
            <span className="border border-white/40 px-2.5 py-1 text-xs uppercase tracking-widest text-white/70">Result hidden</span>
          )}
          {debate.published && (
            <span className="border border-[#d4af37]/70 px-2.5 py-1 text-xs uppercase tracking-widest text-[#d4af37]">On the website</span>
          )}
        </div>
        <h1 className="title mt-4 text-3xl sm:text-4xl font-bold leading-tight">“{debate.title}”</h1>
        <p className="mt-2 text-white/60">
          {[debate.date, debate.time, debate.venue].filter(Boolean).join(" · ") || "No date set"}
        </p>

        {/* Main controls */}
        <div className="mt-8 flex flex-wrap gap-3">
          {s === "draft" && (
            <button type="button" className={primary} disabled={!!busy} onClick={() => act("open")}>
              {busy === "open" ? "Opening…" : "Open voting"}
            </button>
          )}
          {s === "open" && (
            <button type="button" className={primary} disabled={!!busy} onClick={() => act("close", "Close voting? No more votes will be accepted.")}>
              {busy === "close" ? "Closing…" : "Close voting"}
            </button>
          )}
          {s === "closed" && (
            <button type="button" className={outline} disabled={!!busy} onClick={() => act("reopen", "Reopen voting? People who haven’t voted will be able to vote again.")}>
              Reopen voting
            </button>
          )}
          <a href={`${base}/debates/${debate.id}/viewer`} target="_blank" rel="noopener" className={outline}>
            Viewer mode ↗
          </a>
          {s !== "closed" &&
            (debate.hideResults ? (
              <button type="button" className={outline} disabled={!!busy} onClick={() => act("reveal")}>
                Reveal result now
              </button>
            ) : (
              <button type="button" className={outline} disabled={!!busy} onClick={() => act("hide")}>
                Hide result until close
              </button>
            ))}
          {s === "closed" &&
            (debate.published ? (
              <button type="button" className={outline} disabled={!!busy} onClick={() => act("unpublish")}>
                Remove from website
              </button>
            ) : (
              <button type="button" className={primary} disabled={!!busy} onClick={() => act("publish")}>
                Publish result to website
              </button>
            ))}
        </div>
        {s === "closed" && !debate.published && (
          <p className="mt-3 text-sm text-white/60">
            Publishing adds the result to the debate’s page and the Debates archive on kingsunion.org.uk (within about a minute).
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 text-[#f3c4c4]">
            {error}
          </p>
        )}

        {/* Live result */}
        <div className="mt-10 border border-[#d4af37]/60 p-5 sm:p-6">
          <p className="mb-4 text-xs uppercase tracking-widest text-[#d4af37]">
            Result {debate.hideResults && s !== "closed" ? "(only you can see this)" : ""}
          </p>
          <Results counts={counts} closed={s === "closed"} live={s === "open"} />
        </div>

        {/* Speakers */}
        {(debate.proposition.length > 0 || debate.opposition.length > 0) && (
          <div className="mt-8 grid grid-cols-2 gap-6">
            {[
              ["Proposition", debate.proposition],
              ["Opposition", debate.opposition],
            ].map(([side, list]) => (
              <div key={side}>
                <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-1">{side}</p>
                {list.length ? list.map((n) => <p key={n}>{n}</p>) : <p className="text-white/50">None listed</p>}
              </div>
            ))}
          </div>
        )}

        {/* Other actions */}
        <div className="mt-10 border-t border-[#d4af37]/40 pt-6 flex flex-wrap gap-3">
          <a href={`${base}/debates/${debate.id}/edit`} className={outline}>
            Edit details
          </a>
          <button type="button" className={danger} disabled={!!busy} onClick={() => act("reset", "Reset all votes for this debate to zero? Voting goes back to not open, and everyone can vote again. This can’t be undone.")}>
            Reset votes
          </button>
          <button type="button" className={danger} disabled={!!busy} onClick={remove}>
            Delete debate
          </button>
        </div>
      </div>

      {/* Code and QR */}
      <aside className="lg:col-span-5">
        <div className="bg-white p-6 text-[#3d0202]">
          <div className="mx-auto w-full max-w-xs [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p className="mt-5 text-center text-xs uppercase tracking-widest text-[#720000]/70">Debate code</p>
          <p className="title text-center text-6xl font-bold tracking-[0.2em] tabular-nums text-[#720000]">{debate.code}</p>
          <p className="mt-2 text-center text-sm break-all">{link}</p>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onClick={copy} className={outline}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <a href={`/api/admin/debates/${debate.id}/qr?format=png`} className={outline}>
            QR (PNG)
          </a>
          <a href={`/api/admin/debates/${debate.id}/qr?format=svg`} className={outline}>
            QR (SVG)
          </a>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Put the QR code on slides or posters. It opens this debate’s voting page directly. People can also go to the
          voting site and type the code.
        </p>
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import Results from "@/components/voting/results";
import usePoll from "@/components/voting/use_poll";

const LABEL = { aye: "Aye", no: "No" };
const SIDE = { aye: "For the motion", no: "Against the motion" };

export default function VoteClient({ code, initialView, initialChoice }) {
  const [view, setView] = useState(initialView);
  const [choice, setChoice] = useState(initialChoice);
  const [picked, setPicked] = useState(null); // waiting for confirmation
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    const res = await fetch(`/api/vote/${code}`, { cache: "no-store" });
    if (res.ok) setView(await res.json());
  };

  // Keep checking while voting hasn't finished: every 3s once voted (live
  // results), every 4s while waiting for voting to open.
  const finished = view.status === "closed";
  usePoll(refresh, choice ? 3000 : 4000, !finished);

  async function submit() {
    if (!picked || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/vote/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: picked }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.view) setView(data.view);
      if (data.ok || data.reason === "already-voted") setChoice(data.choice || picked);
      if (!data.ok && data.reason !== "already-voted") setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Couldn’t reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
      setPicked(null);
    }
  }

  const speakers = (view.proposition?.length > 0 || view.opposition?.length > 0) && (
    <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm sm:text-base">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-1">Proposition</p>
        {view.proposition.map((n) => <p key={n} className="text-white/85">{n}</p>)}
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-1">Opposition</p>
        {view.opposition.map((n) => <p key={n} className="text-white/85">{n}</p>)}
      </div>
    </div>
  );

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs uppercase tracking-widest text-[#d4af37]">The motion</p>
        <h1 className="title mt-2 text-3xl sm:text-5xl font-bold leading-tight text-balance">“{view.title}”</h1>
        {speakers}

        <div className="mt-10">
          {choice ? (
            <>
              <div className="mb-8 border border-[#d4af37] px-5 py-4">
                <p className="title text-2xl font-bold">Your vote is in.</p>
                <p className="mt-1 text-white/80">
                  You voted <strong className="text-[#d4af37]">{LABEL[choice]}</strong> ({SIDE[choice].toLowerCase()}).
                </p>
              </div>
              <Results counts={view.counts} hidden={view.hidden} closed={finished} />
            </>
          ) : view.status === "open" ? (
            picked ? (
              <div className="border border-[#d4af37] p-5 text-center">
                <p className="text-lg">Confirm your vote:</p>
                <p className="title mt-2 text-4xl font-bold text-[#d4af37]">{LABEL[picked]}</p>
                <p className="text-white/70">{SIDE[picked]}</p>
                <p className="mt-3 text-sm text-white/60">You can only vote once.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    disabled={sending}
                    className="min-h-14 border border-[#d4af37] text-lg font-bold hover:bg-white/10"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="min-h-14 bg-[#d4af37] text-[#3d0202] text-lg font-bold hover:bg-white disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Confirm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {["aye", "no"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPicked(c)}
                    className={`min-h-24 px-6 text-left transition-colors ${
                      c === "aye"
                        ? "bg-[#d4af37] text-[#3d0202] hover:bg-white"
                        : "border-2 border-[#d4af37] text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="title block text-4xl font-bold">{LABEL[c]}</span>
                    <span className="block text-base opacity-80">{SIDE[c]}</span>
                  </button>
                ))}
              </div>
            )
          ) : view.status === "closed" ? (
            <>
              <p className="mb-6 text-lg text-white/80">Voting has closed.</p>
              <Results counts={view.counts} hidden={view.hidden} closed />
            </>
          ) : (
            <div className="border border-[#d4af37]/60 px-5 py-8 text-center">
              <p className="title text-2xl sm:text-3xl font-bold">Voting hasn’t opened yet.</p>
              <p className="mt-2 text-white/70">Keep this page open: it will update as soon as voting opens.</p>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-base text-[#f3c4c4]">
              {error}
            </p>
          )}
        </div>

        <p className="mt-12 text-center text-sm text-white/50">Debate code {code}</p>
      </div>
    </main>
  );
}

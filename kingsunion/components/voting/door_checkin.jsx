"use client";

// Door check-in. Everything is saved on this phone first, so it keeps working
// with no signal; check-ins are sent to the website whenever there's a
// connection, and check-ins from other phones appear every few seconds.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const sans = "[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]";
const btn = "inline-flex items-center justify-center rounded-sm font-semibold whitespace-nowrap";
const store = (slug) => `ku-door:${slug}`;
const EMPTY = { guests: [], hasList: false, checkedIn: {}, walkIns: {}, regularFrom: 3 };

function readLocal(slug) {
  try {
    const raw = localStorage.getItem(store(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeLocal(slug, data) {
  try {
    localStorage.setItem(store(slug), JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    // storage full or blocked: the page still works while it's open
  }
}
function dropLocal(slug) {
  try {
    localStorage.removeItem(store(slug));
  } catch {}
}
// Door lists kept on a phone are deleted after three days.
function tidyOld() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k?.startsWith("ku-door:")) continue;
      const v = JSON.parse(localStorage.getItem(k) || "{}");
      if (!v.savedAt || Date.now() - v.savedAt > 3 * 86400000) localStorage.removeItem(k);
    }
  } catch {}
}

const newKey = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
const time = (ms) => new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const mask = (e) => {
  const [u, d] = String(e).split("@");
  // Enough to tell two people with the same name apart, without the full address.
  return u.length > 5 ? `${u.slice(0, 2)}•••${u.slice(-2)}@${d}` : `${u.slice(0, 1)}•••@${d}`;
};
const plain = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

// The server's state with this phone's unsent changes on top.
function applyQueue(door, queue) {
  const ins = { ...door.checkedIn };
  const walks = { ...door.walkIns };
  for (const a of queue) {
    if (a.type === "in") ins[a.id] = ins[a.id] || { at: a.at, by: "this phone" };
    if (a.type === "out") delete ins[a.id];
    if (a.type === "walkin") walks[a.key] = { n: a.n, at: a.at, by: "this phone" };
    if (a.type === "walkout") delete walks[a.key];
  }
  return { ins, walks };
}

export default function DoorCheckin({ base, events, initialSlug, canFinish }) {
  const [slug, setSlug] = useState(initialSlug);
  const [door, setDoor] = useState(EMPTY);
  const [queue, setQueue] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(0);
  const [q, setQ] = useState("");
  const [show, setShow] = useState("waiting");
  const [walkName, setWalkName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const flushing = useRef(false);
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const search = useRef(null);
  const event = events.find((e) => e.slug === slug);

  const signIn = () => (window.location.href = base || "/");

  // Load this debate: from the phone first, then the website if there's signal.
  useEffect(() => {
    tidyOld();
    setLoaded(false);
    const local = readLocal(slug);
    setDoor(local?.door || EMPTY);
    setQueue(local?.queue || []);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/door?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (res.status === 401) return signIn();
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setDoor(data);
          setOnline(true);
          setLastSync(Date.now());
        }
      } catch {
        if (!cancelled) setOnline(false);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Keep a copy on the phone.
  useEffect(() => {
    if (loaded) writeLocal(slug, { door, queue });
  }, [slug, door, queue, loaded]);

  // Send unsent check-ins, and pick up other phones' check-ins.
  const sync = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    const sending = queueRef.current;
    setSyncing(sending.length > 0);
    try {
      const res = sending.length
        ? await fetch("/api/admin/door", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync", slug, actions: sending }) })
        : await fetch(`/api/admin/door?slug=${encodeURIComponent(slug)}&state=1`, { cache: "no-store" });
      if (res.status === 401) return signIn();
      if (!res.ok) throw new Error();
      const state = await res.json();
      setDoor((d) => ({ ...d, checkedIn: state.checkedIn, walkIns: state.walkIns }));
      setQueue((qu) => qu.slice(sending.length));
      setOnline(true);
      setLastSync(Date.now());
    } catch {
      setOnline(false);
    } finally {
      flushing.current = false;
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!loaded) return;
    const tick = () => document.visibilityState === "visible" && sync();
    const timer = setInterval(tick, queue.length ? 3000 : 8000);
    const goOnline = () => sync();
    window.addEventListener("online", goOnline);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", goOnline);
    };
  }, [loaded, sync, queue.length]);

  const act = (a) => {
    setQueue((qu) => [...qu, a]);
    setTimeout(sync, 50);
  };

  const { ins, walks } = useMemo(() => applyQueue(door, queue), [door, queue]);
  const inCount = Object.keys(ins).length;
  const walkList = Object.entries(walks).sort((a, b) => b[1].at - a[1].at);

  const shown = useMemo(() => {
    const words = plain(q).split(/\s+/).filter(Boolean);
    return door.guests.filter((g) => {
      if (show === "waiting" && ins[g.id]) return false;
      if (show === "in" && !ins[g.id]) return false;
      if (!words.length) return true;
      const hay = plain(`${g.n} ${g.e}`);
      return words.every((w) => hay.includes(w));
    });
  }, [door.guests, q, show, ins]);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const csv = await file.text();
      const res = await fetch("/api/admin/door", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "list", slug, csv }) });
      if (res.status === 401) return signIn();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoor(data);
      setMessage(`Guest list loaded: ${data.guests.length} people going.`);
    } catch (err) {
      setMessage(err.message || "That file couldn’t be read. You need signal to upload it.");
    } finally {
      setBusy(false);
    }
  };

  const post = async (action) => {
    const res = await fetch("/api/admin/door", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, slug }) });
    if (res.status === 401) return signIn();
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "That didn’t work.");
    return data;
  };
  const finish = async () => {
    setBusy(true);
    try {
      await sync();
      if (queueRef.current.length) throw new Error("Some check-ins haven’t been sent yet. Find signal, then try again.");
      const { entry } = await post("finish");
      setMessage(`Attendance saved: ${entry.checkedIn} came. It’s under Attendance now.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };
  const [confirmClear, setConfirmClear] = useState(false);
  const clear = async () => {
    setBusy(true);
    try {
      await post("clear");
      dropLocal(slug);
      setDoor(EMPTY);
      setQueue([]);
      setConfirmClear(false);
      setMessage("Door list deleted from the website and this phone.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const status = !online
    ? { text: queue.length ? `No signal · ${queue.length} waiting to send` : "No signal · saved on this phone", cls: "bg-[#f2d48b] text-[#3d2a02]" }
    : queue.length || syncing
      ? { text: "Sending…", cls: "bg-white/15 text-white" }
      : { text: `All saved${lastSync ? ` · ${time(lastSync)}` : ""}`, cls: "bg-[#c7e6c2] text-[#123d12]" };

  return (
    <div className={sans}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wider text-white/60">Debate</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 h-11 w-full rounded-sm border border-white/25 bg-[#1f0101] px-2 text-base text-white">
            {events.map((e) => (
              <option key={e.slug} value={e.slug} className="bg-white text-black">{e.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Counter and search stay at the top while scrolling */}
      <div className="sticky top-0 z-10 -mx-4 mt-4 border-b border-white/15 bg-[#3d0202] px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
        <div className="flex items-center gap-4">
          <p className="text-4xl font-bold tabular-nums">{inCount + walkList.length}</p>
          <p className="min-w-0 flex-1 text-sm text-white/75">
            in the room
            <span className="block">
              {inCount}{door.hasList ? ` of ${door.guests.length} on the list` : ""} · {walkList.length} walk-in{walkList.length === 1 ? "" : "s"}
            </span>
          </p>
          <span role="status" className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-right text-xs font-bold leading-tight ${status.cls}`}>{status.text}</span>
        </div>
        {door.hasList && (
          <>
            <label className="mt-3 block">
              <span className="sr-only">Search the guest list</span>
              <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" autoComplete="off" enterKeyHint="search"
                className="h-12 w-full rounded-sm border border-white/30 bg-[#1f0101] px-3 text-lg text-white placeholder:text-white/45 focus:border-[#d4af37] focus:outline-none" />
            </label>
            <div className="mt-2 flex gap-1" role="group" aria-label="Show">
              {[["waiting", "Not in yet"], ["in", "Checked in"], ["all", "Everyone"]].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={show === id} onClick={() => setShow(id)}
                  className={`${btn} h-9 px-3 text-sm ${show === id ? "bg-white text-[#2a0101]" : "border border-white/25 text-white/80"}`}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <p role="status" className="mt-3 min-h-5 text-sm text-white/80">{message}</p>

      {loaded && !door.hasList && (
        <div className="mt-2 rounded-sm border border-[#d4af37]/60 bg-[#2a0101] p-4">
          <p className="font-bold">Load the guest list</p>
          <p className="mt-1 text-sm text-white/75">
            Before the doors open, on Luma go to the event, then <strong>Guests → Download as CSV</strong>, and choose the file here.
            You only need signal for this step. Without a list you can still count walk-ins below.
          </p>
          <label className={`${btn} mt-3 h-11 cursor-pointer bg-[#d4af37] px-4 text-[#2a0101] hover:bg-white`}>
            {busy ? "Loading…" : "Choose the Luma CSV"}
            <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
      )}

      {door.hasList && (
        <ul className="divide-y divide-white/10">
          {shown.slice(0, 80).map((g) => {
            const c = ins[g.id];
            const regular = g.visits >= door.regularFrom;
            return (
              <li key={g.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base ${c ? "text-white/60" : "font-semibold"}`}>{g.n}</p>
                  <p className="truncate text-xs text-white/60">
                    {mask(g.e)}
                    {g.visits > 0 && (
                      <span className={regular ? "ml-2 rounded-full bg-[#d4af37] px-1.5 font-bold text-[#2a0101]" : "ml-2"}>
                        {regular ? `Regular · ${g.visits} debates` : `${g.visits} before`}
                      </span>
                    )}
                  </p>
                </div>
                {c ? (
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#c7e6c2]">✓ {time(c.at)}</span>
                    <button type="button" onClick={() => act({ type: "out", id: g.id })} className={`${btn} h-11 px-3 text-sm text-white/70 underline-offset-4 hover:underline`}>
                      Undo<span className="sr-only"> check-in for {g.n}</span>
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => { act({ type: "in", id: g.id, at: Date.now() }); if (q) { setQ(""); search.current?.focus(); } }}
                    className={`${btn} h-11 min-w-[6.5rem] bg-[#d4af37] px-4 text-base text-[#2a0101] active:bg-white`}>
                    Check in<span className="sr-only"> {g.n}</span>
                  </button>
                )}
              </li>
            );
          })}
          {shown.length > 80 && <li className="py-3 text-sm text-white/70">{shown.length - 80} more. Type a name to narrow it down.</li>}
          {!shown.length && <li className="py-4 text-sm text-white/70">{q ? "No one on the list matches. Add them as a walk-in below." : show === "waiting" ? "Everyone on the list is in." : "No one yet."}</li>}
        </ul>
      )}

      {/* Walk-ins */}
      <section className="mt-6 rounded-sm border border-white/15 bg-[#2a0101] p-4" aria-labelledby="walkins">
        <h2 id="walkins" className="font-bold">Walk-ins</h2>
        <p className="text-sm text-white/70">People who aren’t on the list. A name is optional.</p>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); act({ type: "walkin", key: newKey(), n: walkName.trim(), at: Date.now() }); setWalkName(""); }}>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Walk-in’s name (optional)</span>
            <input value={walkName} onChange={(e) => setWalkName(e.target.value)} maxLength={80} placeholder="Name (optional)"
              className="h-11 w-full rounded-sm border border-white/25 bg-[#1f0101] px-3 text-base text-white placeholder:text-white/45 focus:border-[#d4af37] focus:outline-none" />
          </label>
          <button type="submit" className={`${btn} h-11 bg-white px-4 text-[#2a0101]`}>+ Add walk-in</button>
        </form>
        {walkList.length > 0 && (
          <ul className="mt-3 divide-y divide-white/10 text-sm">
            {walkList.map(([key, w]) => (
              <li key={key} className="flex items-center justify-between gap-3 py-1.5">
                <span>{w.n || "Walk-in"} <span className="text-white/60">· {time(w.at)}</span></span>
                <button type="button" onClick={() => act({ type: "walkout", key })} className={`${btn} h-9 px-2 text-white/70 hover:underline`}>
                  Remove<span className="sr-only"> {w.n || "walk-in"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* After the debate */}
      {canFinish && (door.hasList || walkList.length > 0) && (
        <section className="mt-6 border-t border-white/15 pt-4" aria-labelledby="after">
          <h2 id="after" className="font-bold">After the debate</h2>
          <p className="text-sm text-white/70">
            Save everyone who came to Attendance (instead of uploading Luma’s list afterwards), then delete the door list.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy || !event || event.upcoming} onClick={finish} className={`${btn} h-11 bg-[#d4af37] px-4 text-[#2a0101] disabled:opacity-40`}>
              Save attendance
            </button>
            {confirmClear ? (
              <span className="flex items-center gap-2 text-sm">
                Delete the list and check-ins?
                <button type="button" onClick={clear} disabled={busy} className={`${btn} h-11 bg-[#f3c4c4] px-3 text-[#4a0606]`}>Delete</button>
                <button type="button" onClick={() => setConfirmClear(false)} className={`${btn} h-11 border border-white/25 px-3`}>Keep</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmClear(true)} className={`${btn} h-11 border border-white/25 px-4 text-white`}>Delete door list</button>
            )}
          </div>
          {event?.upcoming && <p className="mt-2 text-xs text-white/60">You can save attendance once the debate has started.</p>}
        </section>
      )}
      <p className="mt-6 text-xs text-white/60">
        Open this page while you have signal before going to the door. It keeps working with no signal as long as the page stays open, and anything checked in is kept on this phone until it can be sent.
      </p>
    </div>
  );
}

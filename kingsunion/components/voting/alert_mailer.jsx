"use client";

import { useState } from "react";
import { when, smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-12 px-5 text-base bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;

async function call(url, method, body, base) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 401) {
    window.location.href = base || "/";
    throw new Error("Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
  return data;
}

// Sends a send-out a few emails at a time until it's finished.
async function sendRemaining(campaign, base, onStep) {
  let c = campaign;
  let left = c.total - c.sent - c.failed;
  while (left > 0) {
    const data = await call(`/api/admin/alerts/mail/${c.id}`, "POST", null, base);
    c = data.campaign;
    left = data.left;
    onStep(c, left);
  }
  return c;
}

const blank = { subject: "", message: "", buttonText: "", buttonUrl: "", event: null };

function draftFor(e) {
  if (!e) return blank;
  return {
    subject: `Tickets are live: ${e.title}`,
    message: [
      `Tickets for our next ${e.type === "Debate" ? "debate" : "event"} are now on sale.`,
      e.description || "",
      e.tickets ? "They tend to go quickly, so grab yours now. See you there!" : "Full details are on our website. See you there!",
    ]
      .filter(Boolean)
      .join("\n\n"),
    buttonText: e.tickets ? "Get tickets" : "See the details",
    buttonUrl: e.tickets || e.page,
    event: { title: e.title, when: e.when, venue: e.venue, image: e.image },
  };
}

// Write and send an email to everyone on the ticket-alerts list.
export default function AlertMailer({ base, count, ready, events, initialCampaigns }) {
  const [eventSlug, setEventSlug] = useState("");
  const [draft, setDraft] = useState(blank);
  const [testTo, setTestTo] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [progress, setProgress] = useState(null); // { sent, total }

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  function pickEvent(slug) {
    setEventSlug(slug);
    setDraft(draftFor(events.find((e) => e.slug === slug)));
    setPreview("");
  }

  async function run(name, fn) {
    setBusy(name);
    setError("");
    setNote("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const showPreview = () =>
    run("preview", async () => {
      const { html } = await call("/api/admin/alerts/mail", "POST", { action: "preview", ...draft }, base);
      setPreview(html);
    });

  const sendTest = () =>
    run("test", async () => {
      await call("/api/admin/alerts/mail", "POST", { action: "test", to: testTo, ...draft }, base);
      setNote(`Test sent to ${testTo}. Check it looks right (and isn’t in spam) before sending to everyone.`);
    });

  async function drain(campaign) {
    setProgress({ sent: campaign.sent, total: campaign.total });
    return sendRemaining(campaign, base, (c, left) => {
      setProgress({ sent: c.sent + c.failed, total: c.total });
      setCampaigns((list) => [{ ...c, left }, ...list.filter((x) => x.id !== c.id)]);
    });
  }

  const sendAll = () => {
    if (!window.confirm(`Send “${draft.subject}” to all ${count} people on the ticket-alerts list? This can’t be undone.`)) return;
    run("send", async () => {
      const { campaign } = await call("/api/admin/alerts/mail", "POST", { action: "start", ...draft }, base);
      setCampaigns((list) => [{ ...campaign, left: campaign.total }, ...list]);
      const done = await drain(campaign);
      setProgress(null);
      setNote(`Sent to ${done.sent} ${done.sent === 1 ? "person" : "people"}${done.failed ? `; ${done.failed} couldn’t be sent` : ""}.`);
      setDraft(blank);
      setEventSlug("");
      setPreview("");
    }).finally(() => setProgress(null));
  };

  const resume = (c) =>
    run(`resume-${c.id}`, async () => {
      const done = await drain(c);
      setNote(`Finished: sent to ${done.sent} ${done.sent === 1 ? "person" : "people"}.`);
    }).finally(() => setProgress(null));

  const remove = (c) => {
    if (!window.confirm("Remove this email from the history? (It won’t unsend anything.)")) return;
    run(`del-${c.id}`, async () => {
      await call(`/api/admin/alerts/mail/${c.id}`, "DELETE", null, base);
      setCampaigns((list) => list.filter((x) => x.id !== c.id));
    });
  };

  if (!ready) {
    return (
      <section className="border border-[#d4af37]/60 p-5 sm:p-6">
        <h2 className="title text-2xl font-bold">Email everyone on the list</h2>
        <p className="mt-3 text-white/75">
          Email isn’t set up yet, so this can’t send. In Vercel, open the project → Settings → Environment Variables, add{" "}
          <code className="text-[#d4af37]">SMTP_HOST</code>, <code className="text-[#d4af37]">SMTP_PORT</code>,{" "}
          <code className="text-[#d4af37]">SMTP_USER</code> and <code className="text-[#d4af37]">SMTP_PASS</code> (for Gmail:
          smtp.gmail.com, 465, the address, and an app password), then redeploy. Until then, use “Copy all addresses” below.
        </p>
      </section>
    );
  }

  const canSend = draft.subject.trim() && draft.message.trim() && count > 0;

  return (
    <section className="border border-[#d4af37]/60 p-5 sm:p-6">
      <h2 className="title text-2xl font-bold">Email everyone on the list</h2>
      <p className="mt-2 text-white/70">
        Each person gets their own copy with an unsubscribe link, so nobody sees anyone else’s address.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <label className="block">
          <span className={label}>About a debate (fills in the email for you)</span>
          <select value={eventSlug} onChange={(e) => pickEvent(e.target.value)} className={field}>
            <option value="">— Write my own —</option>
            {events.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.title} · {e.when}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Subject</span>
          <input value={draft.subject} onChange={set("subject")} maxLength={150} className={field} />
        </label>
        <label className="block">
          <span className={label}>Message</span>
          <textarea value={draft.message} onChange={set("message")} rows={7} maxLength={4000} className={field} />
          <span className="mt-1 block text-sm text-white/50">Leave a blank line between paragraphs.</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className={label}>Button text</span>
            <input value={draft.buttonText} onChange={set("buttonText")} maxLength={40} placeholder="Get tickets" className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>Button link (optional)</span>
            <input value={draft.buttonUrl} onChange={set("buttonUrl")} placeholder="https://…" inputMode="url" className={field} />
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={showPreview} disabled={!!busy || !canSend} className={outline}>
          {busy === "preview" ? "Loading…" : "Preview"}
        </button>
      </div>
      {preview && (
        <iframe title="Email preview" srcDoc={preview} sandbox="" className="mt-4 h-[560px] w-full border border-white/20 bg-white" />
      )}

      <div className="mt-6 border-t border-white/15 pt-6">
        <p className={label}>1. Send yourself a test</p>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="your.email@kcl.ac.uk"
            aria-label="Send a test to"
            className={`${field} max-w-sm flex-1 min-w-[220px]`}
          />
          <button type="button" onClick={sendTest} disabled={!!busy || !canSend || !testTo} className={outline}>
            {busy === "test" ? "Sending…" : "Send test"}
          </button>
        </div>
        <p className={`${label} mt-6`}>2. Send to everyone</p>
        <button type="button" onClick={sendAll} disabled={!!busy || !canSend} className={primary}>
          {busy === "send" ? "Sending…" : `Send to all ${count} ${count === 1 ? "person" : "people"}`}
        </button>
        {progress && (
          <div className="mt-4" role="status" aria-live="polite">
            <div className="h-2 w-full max-w-md bg-white/10">
              <div className="h-2 bg-[#d4af37] transition-[width]" style={{ width: `${(progress.sent / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-white/70">
              Sending {progress.sent} of {progress.total}… keep this page open.
            </p>
          </div>
        )}
      </div>

      {note && (
        <p role="status" className="mt-5 border border-[#7fd1a8]/50 px-4 py-3 text-[#c9f0dc]">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 text-[#f3c4c4]">
          {error}
        </p>
      )}

      {campaigns.length > 0 && (
        <div className="mt-8 border-t border-white/15 pt-6">
          <p className={label}>Sent before</p>
          <ul className="mt-2 divide-y divide-white/10">
            {campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold">{c.subject}</p>
                  <p className="text-sm text-white/60">
                    {when(c.createdAt)} · sent to {c.sent} of {c.total}
                    {c.failed ? ` · ${c.failed} failed` : ""}
                    {c.left ? ` · ${c.left} still to send` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {c.left > 0 && (
                    <button type="button" onClick={() => resume(c)} disabled={!!busy} className={outline}>
                      {busy === `resume-${c.id}` ? "Sending…" : "Resume"}
                    </button>
                  )}
                  <button type="button" onClick={() => remove(c)} disabled={!!busy} className={`${smallBtn} border border-white/25 text-white/70 hover:bg-white/10`}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

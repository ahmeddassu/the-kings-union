"use client";

import { useState } from "react";
import { when, smallBtn } from "@/components/voting/inbox_actions";

const primary = `${smallBtn} min-h-12 px-5 text-base bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const size = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

async function readJson(res, base) {
  if (res.status === 401) {
    window.location.href = base || "/";
    throw new Error("Please sign in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "That didn’t work. Please try again.");
  return data;
}

export default function BackupsAdmin({ base, ready, initial, keep }) {
  const [backups, setBackups] = useState(initial);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

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


  const backupNow = () =>
    run("now", async () => {
      const data = await readJson(await fetch("/api/admin/backups", { method: "POST" }), base);
      setBackups(data.backups);
      setNote(`Backed up ${data.saved.keys} items (${size(data.saved.size)}).`);
    });

  const restore = (source) => {
    const typed = window.prompt(
      `This puts back everything in ${source.label}, replacing the current versions of those things (anything added since stays). ${ready ? "A backup of how things are now is made first, so you can undo it." : ""}\n\nType RESTORE to continue.`
    );
    if (typed !== "RESTORE") return;
    run(`restore-${source.label}`, async () => {
      const form = new FormData();
      form.set("confirm", "RESTORE");
      if (source.file) form.set("file", source.file);
      if (source.name) form.set("name", source.name);
      const data = await readJson(await fetch("/api/admin/backups/restore", { method: "POST", body: form }), base);
      setNote(`Restored ${data.restored} items from the backup of ${when(Date.parse(data.from))}.${data.safety ? " The data from before the restore was saved as a backup first." : ""}`);
      if (ready) setBackups((await readJson(await fetch("/api/admin/backups", { cache: "no-store" }), base)).backups);
    });
  };

  return (
    <div className="space-y-10">
      {!ready && (
        <section className="border border-[#d4af37]/60 p-5 sm:p-6">
          <h2 className="title text-2xl font-bold">Turn on automatic backups</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-white/80">
            <li>In Vercel, open the project and go to <strong>Storage</strong>.</li>
            <li>Choose <strong>Create</strong> → <strong>Blob</strong>, and set access to <strong>Private</strong>.</li>
            <li>Connect it to this project (all environments), then redeploy.</li>
          </ol>
          <p className="mt-3 text-white/70">
            After that, a backup is made every night (around 3–4am) and the last {keep} are kept here. Until then you can still
            download a copy by hand below.
          </p>
        </section>
      )}

      <section>
        <div className="flex flex-wrap gap-3">
          {ready && (
            <button type="button" onClick={backupNow} disabled={!!busy} className={primary}>
              {busy === "now" ? "Backing up…" : "Back up now"}
            </button>
          )}
          <a href="/api/admin/backups/download" className={ready ? outline : primary}>
            Download a copy now
          </a>
        </div>
        <p className="mt-3 text-sm text-white/55">
          Backups contain people’s names, emails and messages. If you download one, keep it somewhere private and delete it when you no longer need it.
        </p>
      </section>

      {note && (
        <p role="status" className="border border-[#7fd1a8]/50 px-4 py-3 text-[#c9f0dc]">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="text-[#f3c4c4]">
          {error}
        </p>
      )}

      {ready && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Saved backups</h2>
          {backups.length === 0 ? (
            <p className="mt-3 text-white/60">None yet. The first one is made tonight, or press “Back up now”.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {backups.map((b, i) => (
                <li key={b.pathname} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-bold">
                      {when(b.uploadedAt)}
                      {i === 0 && <span className="ml-2 border border-[#d4af37]/70 px-2 py-0.5 text-xs uppercase tracking-widest text-[#d4af37]">Latest</span>}
                    </p>
                    <p className="text-sm text-white/55">{size(b.size)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/api/admin/backups/download?name=${encodeURIComponent(b.name)}`} className={outline}>
                      Download
                    </a>
                    <button type="button" disabled={!!busy} onClick={() => restore({ name: b.name, label: `the backup from ${when(b.uploadedAt)}` })} className={danger}>
                      {busy === `restore-the backup from ${when(b.uploadedAt)}` ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="border-t border-white/15 pt-8">
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Restore from a file</h2>
        <p className="mt-2 text-white/70">If you downloaded a backup, you can put it back here.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".gz,.json,application/gzip,application/json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            aria-label="Backup file"
            className="max-w-full text-sm file:mr-3 file:border file:border-[#d4af37]/70 file:bg-transparent file:px-4 file:py-2 file:font-bold file:text-white"
          />
          <button type="button" disabled={!file || !!busy} onClick={() => restore({ file, label: file?.name || "that file" })} className={danger}>
            {busy.startsWith("restore-") && file && busy.endsWith(file.name) ? "Restoring…" : "Restore this file"}
          </button>
        </div>
      </section>
    </div>
  );
}

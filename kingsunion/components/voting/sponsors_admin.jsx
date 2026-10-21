"use client";

import { useState } from "react";
import { smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-11 px-5 bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;
const danger = `${smallBtn} border border-[#f3c4c4]/60 text-[#f3c4c4] hover:bg-[#f3c4c4]/10`;
const blank = { name: "", tier: "Partner", description: "", href: "", hidden: false };

async function call(url, method, body, base, raw = false) {
  const res = await fetch(url, {
    method,
    headers: body && !raw ? { "Content-Type": "application/json" } : raw ? { "Content-Type": "application/octet-stream" } : undefined,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
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

// Shrinks a logo in the browser to at most 800×400 and saves it as a PNG
// (keeping any transparency), so uploads stay small and load fast.
function shrinkLogo(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 800, h = img.naturalHeight || 400;
      const k = Math.min(1, 800 / w, 400 / h);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((png) => {
        if (png && png.size <= 380 * 1024) return resolve(png);
        c.toBlob((webp) => (webp ? resolve(webp) : reject(new Error("Couldn’t read that image."))), "image/webp", 0.9);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn’t read that image. Try a PNG, JPG or SVG."));
    };
    img.src = url;
  });
}

function SponsorForm({ initial, tiers, onSave, onCancel, busy, submitLabel }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <label className="block">
        <span className={label}>Name</span>
        <input required maxLength={80} value={f.name} onChange={set("name")} className={field} />
      </label>
      <label className="block">
        <span className={label}>Tier</span>
        <select value={f.tier} onChange={set("tier")} className={field}>
          {tiers.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className={label}>Website</span>
        <input value={f.href} onChange={set("href")} placeholder="https://" inputMode="url" maxLength={300} className={field} />
      </label>
      <label className="block md:col-span-2">
        <span className={label}>A line about them</span>
        <textarea value={f.description} onChange={set("description")} rows={3} maxLength={400} className={field} />
        <span className="mt-1 block text-sm text-white/50">Shown for the sponsor at the top of the list (the lead partner).</span>
      </label>
      <label className="flex items-center gap-3 md:col-span-2">
        <input type="checkbox" checked={f.hidden} onChange={set("hidden")} className="h-5 w-5 accent-[#d4af37]" />
        <span>Hide from the website (e.g. when a deal has ended)</span>
      </label>
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <button type="submit" disabled={busy} className={primary}>{submitLabel}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={outline}>Cancel</button>
        )}
      </div>
    </form>
  );
}

export default function SponsorsAdmin({ base, initial, tiers }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

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
  const replace = (s) => setList((l) => l.map((x) => (x.id === s.id ? s : x)));

  const save = (s) => (f) =>
    run(`save-${s.id}`, async () => {
      const { sponsor } = await call(`/api/admin/sponsors/${s.id}`, "PUT", f, base);
      replace(sponsor);
      setEditing(null);
      setNote(`Saved. ${sponsor.name} is updated on the website.`);
    });

  const add = (f) =>
    run("add", async () => {
      const { sponsor } = await call("/api/admin/sponsors", "POST", f, base);
      setList((l) => [...l, sponsor]);
      setAdding(false);
      setNote(`Added ${sponsor.name}. Upload their logo below.`);
    });

  const move = (s, dir) =>
    run(`move-${s.id}`, async () => {
      const { sponsors } = await call(`/api/admin/sponsors/${s.id}`, "PATCH", { move: dir }, base);
      setList(sponsors);
    });

  const remove = (s) => {
    if (!window.confirm(`Remove ${s.name} completely? (To take them off the website for now, use “Hide” instead.)`)) return;
    run(`del-${s.id}`, async () => {
      await call(`/api/admin/sponsors/${s.id}`, "DELETE", null, base);
      setList((l) => l.filter((x) => x.id !== s.id));
    });
  };

  const upload = (s, file) =>
    run(`logo-${s.id}`, async () => {
      const small = await shrinkLogo(file);
      const { sponsor } = await call(`/api/admin/sponsors/${s.id}/logo`, "POST", small, base, true);
      replace(sponsor);
      setNote(`Logo uploaded for ${sponsor.name}.`);
    });

  const dropLogo = (s) =>
    run(`logo-${s.id}`, async () => {
      const { sponsor } = await call(`/api/admin/sponsors/${s.id}/logo`, "DELETE", null, base);
      replace(sponsor);
    });

  return (
    <div className="space-y-8">
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

      {list.length === 0 && <p className="border border-dashed border-[#d4af37]/60 px-6 py-10 text-center text-white/70">No sponsors yet.</p>}
      <ol className="space-y-4">
        {list.map((s, i) => (
          <li key={s.id} className={`border p-4 sm:p-5 ${s.hidden ? "border-white/15 opacity-75" : "border-[#d4af37]/60"}`}>
            {editing === s.id ? (
              <SponsorForm initial={{ name: s.name, tier: s.tier, description: s.description, href: s.href, hidden: s.hidden }} tiers={tiers} onSave={save(s)} onCancel={() => setEditing(null)} busy={!!busy} submitLabel="Save" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr_auto] gap-5 items-start">
                {/* logo, previewed on the site's background */}
                <div className="flex min-h-24 items-center justify-center bg-[#3d0202] border border-white/10 p-3">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt={`${s.name} logo`} className="max-h-16 w-auto max-w-full" />
                  ) : (
                    <span className="title text-xl font-bold text-center">{s.name}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-[#d4af37]">
                    {i === 0 ? "Shown first (lead partner) · " : ""}
                    {s.tier}
                    {s.hidden ? " · Hidden" : ""}
                  </p>
                  <p className="title mt-1 text-2xl font-bold">{s.name}</p>
                  {s.href && <p className="text-sm text-white/60 break-all">{s.href}</p>}
                  {s.description && <p className="mt-2 text-white/80">{s.description}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className={`${outline} cursor-pointer`}>
                      {busy === `logo-${s.id}` ? "Uploading…" : s.logoUrl ? "Change logo" : "Upload logo"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="sr-only"
                        disabled={!!busy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) upload(s, f);
                        }}
                      />
                    </label>
                    {s.logoUrl && (
                      <button type="button" disabled={!!busy} onClick={() => dropLogo(s)} className={`${smallBtn} text-white/60 underline underline-offset-4 hover:text-white`}>
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button type="button" disabled={!!busy} onClick={() => setEditing(s.id)} className={outline}>Edit</button>
                  <button type="button" disabled={!!busy || i === 0} onClick={() => move(s, "up")} className={outline} aria-label={`Move ${s.name} up`}>↑ Up</button>
                  <button type="button" disabled={!!busy || i === list.length - 1} onClick={() => move(s, "down")} className={outline} aria-label={`Move ${s.name} down`}>↓ Down</button>
                  <button type="button" disabled={!!busy} onClick={() => remove(s)} className={danger}>Remove</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>

      <p className="text-sm text-white/55">
        Logos show on the site’s dark red background, so a white or light version works best. Only use a sponsor’s logo
        with their permission.
      </p>

      <section className="border border-[#d4af37]/60 p-5 sm:p-6">
        {adding ? (
          <>
            <h2 className="title text-2xl font-bold mb-5">Add a sponsor</h2>
            <SponsorForm initial={blank} tiers={tiers} onSave={add} onCancel={() => setAdding(false)} busy={!!busy} submitLabel={busy === "add" ? "Adding…" : "Add sponsor"} />
          </>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={primary}>+ Add a sponsor</button>
        )}
      </section>
    </div>
  );
}

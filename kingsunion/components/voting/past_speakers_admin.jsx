"use client";

import { useState } from "react";
import { smallBtn } from "@/components/voting/inbox_actions";

const field = "w-full border border-[#d4af37]/50 bg-[#2a0101] px-3 py-2.5 text-base text-white outline-none focus:border-white";
const label = "block text-xs uppercase tracking-widest text-[#d4af37] mb-1.5";
const primary = `${smallBtn} min-h-11 px-5 bg-[#d4af37] text-[#3d0202] hover:bg-white`;
const outline = `${smallBtn} border border-[#d4af37]/70 text-white hover:bg-white/10`;

function signIn(base) {
  window.location.href = base || "/";
}

async function call(url, method, body, base, raw = false) {
  const res = await fetch(url, {
    method,
    headers: raw ? { "Content-Type": "application/octet-stream" } : body ? { "Content-Type": "application/json" } : undefined,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
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

// Crops a photo to a square from the middle and shrinks it to 600×600 JPEG in
// the browser, so uploads stay small and every card lines up.
function squarePhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const side = Math.min(w, h);
      const size = Math.min(600, side);
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      // Faces are usually in the upper part of a portrait, so crop tall photos from near the top.
      const sx = (w - side) / 2;
      const sy = h > w ? Math.min((h - side) / 2, h * 0.08) : 0;
      c.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      c.toBlob((jpg) => (jpg ? resolve(jpg) : reject(new Error("Couldn’t read that image."))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn’t read that image. Try a JPG or PNG."));
    };
    img.src = url;
  });
}

function Speaker({ p, base, onChange }) {
  const [f, setF] = useState({ title: p.title, href: p.href, hidden: p.hidden });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const id = `sp-${p.slug}`;

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

  const save = (e) => {
    e.preventDefault();
    run("save", async () => {
      await call(`/api/admin/past-speakers/${p.slug}`, "PUT", { ...f, name: p.name }, base);
      onChange({ ...p, ...f });
      setNote("Saved.");
    });
  };

  const upload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    run("photo", async () => {
      const blob = await squarePhoto(file);
      const { photo } = await call(`/api/admin/past-speakers/${p.slug}/photo`, "POST", blob, base, true);
      onChange({ ...p, ...f, photo });
      setNote("Photo uploaded.");
    });
  };

  const removePhoto = () =>
    run("remove", async () => {
      await call(`/api/admin/past-speakers/${p.slug}/photo`, "DELETE", null, base);
      onChange({ ...p, ...f, photo: "" });
      setNote("Photo removed.");
    });

  return (
    <li className={`border border-[#d4af37]/50 bg-[#2a0101] p-4 sm:p-5 ${f.hidden ? "opacity-70" : ""}`}>
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="shrink-0">
          {p.photo ? (
            <img src={p.photo} alt={`Photo of ${p.name}`} className="h-28 w-28 object-cover" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center border border-dashed border-[#d4af37]/50 text-center text-xs text-white/60">
              No photo
            </div>
          )}
          <div className="mt-2 flex flex-col gap-1">
            <label className={`${outline} cursor-pointer text-center`}>
              {busy === "photo" ? "Uploading…" : p.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={upload} className="sr-only" disabled={Boolean(busy)} />
            </label>
            {p.photo && (
              <button type="button" onClick={removePhoto} disabled={Boolean(busy)} className={outline}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        <form onSubmit={save} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <p className="title text-2xl font-bold">
              {p.name}
              <span className="ml-3 align-middle text-xs font-normal uppercase tracking-widest text-[#d4af37]">
                {p.student ? "King’s student" : "Guest"}
              </span>
            </p>
            <p className="mt-1 text-sm text-white/60">{p.debates.join(" · ")}</p>
          </div>
          <label className="block" htmlFor={`${id}-title`}>
            <span className={label}>Title (one line)</span>
            <input id={`${id}-title`} value={f.title} onChange={set("title")} maxLength={120} className={field} />
          </label>
          <label className="block" htmlFor={`${id}-href`}>
            <span className={label}>Link (their website or profile)</span>
            <input id={`${id}-href`} value={f.href} onChange={set("href")} placeholder="https://" inputMode="url" maxLength={300} className={field} />
          </label>
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" checked={f.hidden} onChange={set("hidden")} className="h-5 w-5 accent-[#d4af37]" />
            <span>Hide from the Speakers page</span>
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={Boolean(busy)} className={primary}>
              {busy === "save" ? "Saving…" : "Save"}
            </button>
            <span role="status" className="text-sm">
              {error ? <span className="text-[#f3c4c4]">{error}</span> : note ? <span className="text-[#d4af37]">{note}</span> : null}
            </span>
          </div>
        </form>
      </div>
    </li>
  );
}

export default function PastSpeakersAdmin({ base, initial }) {
  const [list, setList] = useState(initial);
  const [show, setShow] = useState("guests");
  const replace = (p) => setList((l) => l.map((x) => (x.slug === p.slug ? p : x)));
  const shown = list.filter((p) => (show === "guests" ? !p.student : p.student));

  if (!list.length) {
    return <p className="text-white/70">Speakers appear here once a debate with named speakers has happened.</p>;
  }

  return (
    <>
      <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
        {[
          ["guests", `Guests (${list.filter((p) => !p.student).length})`],
          ["students", `King’s students (${list.filter((p) => p.student).length})`],
        ].map(([k, text]) => (
          <button
            key={k}
            type="button"
            aria-pressed={show === k}
            onClick={() => setShow(k)}
            className={show === k ? primary : outline}
          >
            {text}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/60">
        Someone listed in the wrong group? King’s students are listed in <code>lib/speakers.js</code>.
      </p>
      <ul className="mt-6 space-y-4">
        {shown.map((p) => (
          <Speaker key={p.slug} p={p} base={base} onChange={replace} />
        ))}
      </ul>
    </>
  );
}

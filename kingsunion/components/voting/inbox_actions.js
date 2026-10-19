"use client";

// Shared PATCH/DELETE helper for the admin inbox lists.
export async function inboxRequest(url, method, body, base) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = base || "/";
    return null;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) throw new Error(data.error || "That didn’t work. Please try again.");
  return data;
}

export const when = (t) =>
  new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const smallBtn =
  "inline-flex min-h-11 items-center justify-center px-4 text-sm font-bold transition-colors disabled:opacity-50";

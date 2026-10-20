"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { statsBlocked } from "@/lib/stats_optout";

// Counts visits for our own stats (admin → Visitor stats). No cookies and
// nothing saved in the browser: everything below lives in memory and is gone
// when the page closes. Grouping pages into visits happens on the server (see
// lib/visitor_stats.js). Honours Do Not Track, Global Privacy Control and the
// opt-out on /privacy.

const visit = {
  firstSent: false, // the first page of this page load carries where they came from
  page: null, // { path, visibleMs, maxScroll, sent }
  lastPath: null,
  shownAt: null,
};
let owner = null; // only one tracker runs even if the component appears twice

function send(hit) {
  const body = JSON.stringify(hit);
  try {
    if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) {
      fetch("/api/hit", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    // never let stats break the page
  }
}

const visible = () => document.visibilityState === "visible";

function settleTime() {
  if (visit.shownAt != null) {
    const ms = performance.now() - visit.shownAt;
    if (visit.page) visit.page.visibleMs += ms;
    visit.shownAt = visible() ? performance.now() : null;
  }
}

function scrollPct() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max <= 0 ? 100 : Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100));
}

function leavePage() {
  const p = visit.page;
  if (!p || p.path.startsWith("404:")) return;
  settleTime();
  send({ type: "leave", path: p.path, secs: Math.round(p.visibleMs / 1000), scroll: p.maxScroll, more: p.sent });
  p.sent = true;
  p.visibleMs = 0;
}

function utmFromUrl() {
  const q = new URLSearchParams(location.search);
  const utm = { source: q.get("utm_source") || q.get("ref") || "", medium: q.get("utm_medium") || "", campaign: q.get("utm_campaign") || "" };
  return utm.source ? utm : null;
}

// What a click on a link means, in plain words. Internal links aren't
// recorded here because the next page view already shows them.
function describeLink(a) {
  if (a.dataset.track) return a.dataset.track;
  const href = a.getAttribute("href") || "";
  if (href.startsWith("webcal:")) return "Calendar: Apple";
  if (href.startsWith("mailto:")) return "Email link";
  if (href.startsWith("tel:")) return "Phone link";
  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return null;
  }
  if (/calendar\.google\.com/.test(url.host)) return "Calendar: Google";
  if (/outlook\.(live|office)\.com/.test(url.host)) return "Calendar: Outlook";
  if (/\.ics$/.test(url.pathname) || /^\/api\/calendar\//.test(url.pathname)) return "Calendar: file";
  if (/voting\.kingsunion/.test(url.host)) return "Vote banner";
  if (url.host === location.host) return null;
  const host = url.host.replace(/^www\./, "");
  const text = (a.textContent || "").toLowerCase();
  if (/ticket/.test(text) || /fixr|ticketsource|eventbrite|ticketmaster|skiddle|tickettailor|dice\.fm/.test(host)) return `Tickets: ${host}`;
  if (/kclsu\.org/.test(host) && /join|member/.test(text)) return "Join: KCLSU membership";
  return `Link: ${host}`;
}

export default function PageView({ notFound = false }) {
  const path = usePathname();

  // Clicks, forms, time on screen and the end of the visit.
  useEffect(() => {
    if (owner || statsBlocked()) return;
    const me = {};
    owner = me;
    visit.shownAt = visible() ? performance.now() : null;

    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      const label = a && describeLink(a);
      if (label) send({ type: "event", path: location.pathname, label });
    };
    const onSubmit = (e) => {
      const f = e.target;
      if (!(f instanceof HTMLFormElement)) return;
      const action = new URL(f.action || location.href, location.href).pathname;
      const team = f.querySelector("input[name=team]")?.value;
      send({ type: "event", path: location.pathname, label: f.dataset.track || `Form: ${action}${team ? ` (${team})` : ""}` });
    };
    const onScroll = () => {
      if (visit.page) visit.page.maxScroll = Math.max(visit.page.maxScroll, scrollPct());
    };
    const onVisibility = () => {
      if (visible()) {
        visit.shownAt = performance.now();
      } else {
        leavePage();
      }
    };
    const onHide = () => {
      if (visible()) {
        leavePage();
      }
    };
    const ping = setInterval(() => {
      if (visible() && visit.lastPath && !visit.page?.path.startsWith("404:")) send({ type: "ping", path: visit.lastPath });
    }, 60_000);

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("submit", onSubmit, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      if (owner !== me) return;
      owner = null;
      clearInterval(ping);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("submit", onSubmit, { capture: true });
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  // Each page shown.
  useEffect(() => {
    if (!path || statsBlocked()) return;
    // A page that doesn't exist is counted separately, so broken links can be fixed.
    if (notFound || document.querySelector("[data-not-found]")) {
      if (visit.page?.path !== `404:${path}`) {
        visit.page = { path: `404:${path}`, visibleMs: 0, maxScroll: 0, sent: true };
        send({ type: "notfound", path });
      }
      return;
    }
    if (visit.page?.path === path) return;
    leavePage();
    const first = !visit.firstSent;
    visit.firstSent = true;
    visit.page = { path, visibleMs: 0, maxScroll: 0, sent: false };
    visit.lastPath = path;
    send({
      type: "view",
      path,
      ...(first ? { referrer: document.referrer || "", utm: utmFromUrl(), width: window.innerWidth } : {}),
    });
    const t = setTimeout(() => {
      if (visit.page?.path === path) visit.page.maxScroll = Math.max(visit.page.maxScroll, scrollPct());
    }, 500);
    return () => clearTimeout(t);
  }, [path, notFound]);

  return null;
}

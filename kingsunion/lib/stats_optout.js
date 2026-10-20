// The "don't count my visits" switch on /privacy. The only thing the stats
// keep in someone's browser, and only if they ask for it.
export const OPT_OUT_KEY = "ku_stats_optout";

export function statsBlocked() {
  if (typeof navigator === "undefined") return true;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return true;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

// The voting and admin screens run on their own subdomains
// (voting.kingsunion.org.uk, admin.kingsunion.org.uk), and also at
// /vote and /admin on the main site. Links use this prefix so they work on both.
import { headers } from "next/headers";

export async function basePath(section) {
  const host = ((await headers()).get("host") || "").toLowerCase();
  return host.startsWith(`${section === "vote" ? "voting" : section}.`) ? "" : `/${section}`;
}

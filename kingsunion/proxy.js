// Sends the subdomains to their sections of the site:
//   voting.kingsunion.org.uk/12345  ->  /vote/12345
//   admin.kingsunion.org.uk/...     ->  /admin/...
// The main site is untouched (its /vote and /admin paths also work).
import { NextResponse } from "next/server";

const SECTIONS = { "voting.": "/vote", "admin.": "/admin" };

export function proxy(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const prefix = Object.entries(SECTIONS).find(([sub]) => host.startsWith(sub))?.[1];
  if (!prefix) return NextResponse.next();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // API calls and files keep their paths.
  if (path.startsWith("/api/")) return NextResponse.next();

  // Tidy up links that already include the section, e.g. admin.../admin/x -> admin.../x
  if (path === prefix || path.startsWith(`${prefix}/`)) {
    url.pathname = path.slice(prefix.length) || "/";
    return NextResponse.redirect(url);
  }

  url.pathname = prefix + (path === "/" ? "" : path);
  const response = NextResponse.rewrite(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Everything except build files and files with an extension (images, icons...).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};

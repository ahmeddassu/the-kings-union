// Temporary password lock while the site is being finished.
// To open the site to everyone, set LOCKED to false (or delete this file).
//
// Visitors get a login box: any username, plus the password. Only a SHA-256
// fingerprint of the password is stored here, because this repository is public.
// To change the password, replace PASSWORD_SHA256 with the output of:
//   printf '%s' 'new-password' | shasum -a 256
import { NextResponse } from "next/server";

const LOCKED = true;
const PASSWORD_SHA256 = "b0151179505b97c16e4d3fbb68d18ce4a0965d49f22396c180e2b3cbacd74690";

async function sha256(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function proxy(request) {
  if (!LOCKED) return NextResponse.next();

  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if ((await sha256(password)) === PASSWORD_SHA256) return NextResponse.next();
    } catch {
      // fall through to the login prompt
    }
  }

  return new NextResponse("This site is being updated. Please check back soon.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="The Kings Union (preview)", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Everything except Next's own build files.
  matcher: ["/((?!_next/static|_next/image).*)"],
};

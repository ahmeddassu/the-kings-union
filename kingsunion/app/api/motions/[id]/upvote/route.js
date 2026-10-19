// Upvotes a motion shown on the website: one upvote per visitor per motion.
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { upvoteMotion, storeConfigured } from "@/lib/submissions";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "ku_visitor";

export async function POST(_request, { params }) {
  if (!storeConfigured) return Response.json({ error: "Not available." }, { status: 503 });
  const { id } = await params;
  const jar = await cookies();
  let visitor = jar.get(VISITOR_COOKIE)?.value;
  if (!/^[a-f0-9]{32}$/.test(visitor || "")) {
    visitor = randomBytes(16).toString("hex");
    jar.set(VISITOR_COOKIE, visitor, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  try {
    const upvotes = await upvoteMotion(id, visitor);
    if (upvotes == null) return Response.json({ error: "That motion isn’t open for votes." }, { status: 404 });
    return Response.json({ upvotes: Number(upvotes) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Upvote failed:", err);
    return Response.json({ error: "Couldn’t save your vote. Please try again." }, { status: 500 });
  }
}

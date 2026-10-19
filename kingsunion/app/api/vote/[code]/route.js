// Public voting API for one debate (by its 5-digit code).
//   GET  -> the debate and live results (cached for 2 seconds, so a full chamber
//           refreshing at once doesn't overload the database)
//   POST -> cast a vote: { choice: "aye" | "no" }. One vote per device.
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { storeConfigured } from "@/lib/store";
import { getDebateByCode, getCounts, castVote, getBallot, publicView, isCode } from "@/lib/voting";

export const dynamic = "force-dynamic";

const VOTER_COOKIE = "ku_voter";
const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function GET(_request, { params }) {
  const { code } = await params;
  if (!storeConfigured) return json({ error: "Voting isn't set up yet." }, 503);
  if (!isCode(code)) return json({ error: "That isn't a valid code." }, 404);
  const debate = await getDebateByCode(code);
  if (!debate) return json({ error: "No debate has that code." }, 404);
  const view = publicView(debate, await getCounts(debate.id));
  return json(view, 200, { "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4" });
}

export async function POST(request, { params }) {
  const { code } = await params;
  if (!storeConfigured) return json({ error: "Voting isn't set up yet." }, 503);
  const debate = await getDebateByCode(code);
  if (!debate) return json({ error: "No debate has that code." }, 404);

  const body = await request.json().catch(() => ({}));
  const jar = await cookies();
  let voterId = jar.get(VOTER_COOKIE)?.value;
  if (!/^[a-f0-9]{32}$/.test(voterId || "")) voterId = randomBytes(16).toString("hex");
  jar.set(VOTER_COOKIE, voterId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const result = await castVote(debate, voterId, body.choice);
  const choice = result.ok ? body.choice : await getBallot(debate.id, voterId);
  const view = publicView(debate, await getCounts(debate.id));
  if (result.ok) return json({ ok: true, choice, view });

  const messages = {
    invalid: "Please choose Aye or No.",
    closed: "Voting has closed for this debate.",
    "not-open": "Voting hasn't opened yet.",
    "already-voted": "You've already voted in this debate.",
  };
  return json({ ok: false, reason: result.reason, error: messages[result.reason], choice, view }, 409);
}

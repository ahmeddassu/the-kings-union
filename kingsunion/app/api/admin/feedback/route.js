// Feedback (Events, Growth, Executive).
//   POST   { on }       switch the morning-after feedback email on or off
//   DELETE ?debate=…    delete one debate's responses
import { can, refuse } from "@/lib/admin_auth";
import { setFeedbackEmail, deleteFeedback, isSlug } from "@/lib/feedback";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const admin = await can("feedback");
  if (!admin) return refuse();
  const { on } = await request.json().catch(() => ({}));
  await setFeedbackEmail(Boolean(on));
  await logAction(admin, `Switched the morning-after feedback email ${on ? "on" : "off"}`);
  return Response.json({ on: Boolean(on) });
}

export async function DELETE(request) {
  const admin = await can("feedback");
  if (!admin) return refuse();
  const slug = new URL(request.url).searchParams.get("debate");
  if (!isSlug(slug)) return Response.json({ error: "Please choose a debate." }, { status: 400 });
  await deleteFeedback(slug);
  await logAction(admin, `Deleted the feedback for ${slug}`);
  return Response.json({ ok: true });
}

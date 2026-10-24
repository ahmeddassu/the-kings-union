// Admin notifications (the bell). Anyone signed in.
//   GET                          { notes, unread }
//   POST { action: "read" }      mark everything as read
//   POST { action: "clear" }     delete your notifications
import { getAdmin } from "@/lib/admin_auth";
import { getNotes, markRead, clearNotes } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Please sign in again." }, { status: 401 });
  return Response.json(await getNotes(admin), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { action } = await request.json().catch(() => ({}));
  if (action === "read") await markRead(admin);
  else if (action === "clear") await clearNotes(admin);
  else return Response.json({ error: "Unknown action." }, { status: 400 });
  return Response.json({ ok: true });
}

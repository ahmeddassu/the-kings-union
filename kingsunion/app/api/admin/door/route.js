// Door check-in (Events and the Executive: the "attendance" section).
//   GET  ?slug=…                            the guest list and who's checked in
//   GET  ?slug=…&state=1                    just who's checked in (for syncing)
//   POST { action: "list", slug, csv }      upload the Luma guest list
//   POST { action: "sync", slug, actions }  check-ins from a phone; returns who's checked in
//   POST { action: "finish", slug }         save attendance (after the debate has started)
//   POST { action: "clear", slug }          delete the door list and check-ins
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { getEvents } from "@/lib/sheet";
import { MAX_CSV_BYTES } from "@/lib/attendance";
import { getDoor, getDoorState, saveDoorList, applyActions, finishDoor, clearDoor, isSlug } from "@/lib/door";

export const dynamic = "force-dynamic";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const bad = (error, status = 400) => Response.json({ error }, { status });
const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET(request) {
  const admin = await can("attendance");
  if (!admin) return refuse();
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!isSlug(slug)) return bad("Please choose the debate.");
  return Response.json(url.searchParams.get("state") ? await getDoorState(slug) : await getDoor(slug), noStore);
}

export async function POST(request) {
  const admin = await can("attendance");
  if (!admin) return refuse();
  if (Number(request.headers.get("content-length") || 0) > MAX_CSV_BYTES * 1.1) return bad("That file is too big.");
  const body = await request.json().catch(() => ({}));
  const event = (await getEvents().catch(() => [])).find((e) => e.slug === body.slug);
  if (!event) return bad("Please choose the debate.");
  try {
    if (body.action === "list") {
      const n = await saveDoorList(event.slug, String(body.csv || "").slice(0, MAX_CSV_BYTES), admin.name);
      await logAction(admin, `Uploaded the door list for ${event.title} (${n} going)`);
      return Response.json(await getDoor(event.slug), noStore);
    }
    if (body.action === "sync") {
      await applyActions(event.slug, body.actions, admin.name);
      return Response.json(await getDoorState(event.slug), noStore);
    }
    if (body.action === "finish") {
      if (event.date > today()) return bad("Attendance can be saved once the debate has started.");
      const entry = await finishDoor(event, admin.name);
      await logAction(admin, `Saved door attendance for ${event.title} (${entry.checkedIn} came)`);
      return Response.json({ entry });
    }
    if (body.action === "clear") {
      await clearDoor(event.slug);
      await logAction(admin, `Cleared the door list for ${event.title}`);
      return Response.json({ ok: true });
    }
  } catch (err) {
    return bad(err?.message || "That didn’t work.");
  }
  return bad("Unknown action.");
}

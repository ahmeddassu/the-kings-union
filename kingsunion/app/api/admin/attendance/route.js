// Events / Executive: attendance from Luma check-ins.
//   POST   { slug, csv }        upload a Luma guest list for an event that has happened
//   PUT    { threshold }        how many events make someone a regular
//   DELETE ?slug=…  or  ?all=1  delete one event's attendance, or all of it
import { can, refuse } from "@/lib/admin_auth";
import { saveAttendance, deleteAttendance, deleteAllAttendance, saveSettings, MAX_CSV_BYTES } from "@/lib/attendance";
import { getEvents } from "@/lib/sheet";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export async function POST(request) {
  const admin = await can("attendance");
  if (!admin) return refuse();
  if (Number(request.headers.get("content-length") || 0) > MAX_CSV_BYTES * 1.1)
    return Response.json({ error: "That file is too big." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const event = (await getEvents()).find((e) => e.slug === body.slug);
  if (!event) return Response.json({ error: "Please choose the event." }, { status: 400 });
  if (event.date > today()) return Response.json({ error: "That event hasn’t happened yet." }, { status: 400 });
  try {
    const entry = await saveAttendance(event, String(body.csv || "").slice(0, MAX_CSV_BYTES), admin.name);
    await logAction(admin, `Uploaded attendance for ${event.title} (${entry.checkedIn} checked in)`);
    return Response.json({ entry });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  const admin = await can("attendance");
  if (!admin) return refuse();
  const settings = await saveSettings(await request.json().catch(() => ({})));
  await logAction(admin, `Set regulars to ${settings.threshold}+ events`);
  return Response.json({ settings });
}

export async function DELETE(request) {
  const admin = await can("attendance");
  if (!admin) return refuse();
  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1") {
    await deleteAllAttendance();
    await logAction(admin, "Deleted all attendance records");
    return Response.json({ ok: true });
  }
  const slug = url.searchParams.get("slug");
  if (!(await deleteAttendance(slug))) return Response.json({ error: "Nothing to delete." }, { status: 404 });
  await logAction(admin, `Deleted attendance for ${slug}`);
  return Response.json({ ok: true });
}

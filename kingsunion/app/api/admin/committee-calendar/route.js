// The committee calendar (anyone with the Dashboard).
//   POST { action: "save", item }     add (no id) or change an entry
//   POST { action: "delete", id }     delete an entry
//   POST { action: "link", reset }    your private subscribe link (reset makes a new one)
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { saveItem, deleteItem, feedToken, describeWhen } from "@/lib/committee_calendar";
import { notifyNames } from "@/lib/notifications";
import { listTeam } from "@/lib/team";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const bad = (error, status = 400) => Response.json({ error }, { status });

export async function POST(request) {
  const admin = await can("dashboard");
  if (!admin) return refuse();
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "save") {
      const { before, item } = await saveItem(body.item, admin);
      await logAction(admin, `${before ? "Changed" : "Added"} “${item.title}” on the committee calendar (${item.date})`);
      const team = await listTeam().catch(() => []);
      const at = describeWhen(item.date, item.time);
      const href = `/committee-calendar?item=${item.id}`;
      const added = item.attendees.filter((n) => !before?.attendees?.includes(n));
      if (added.length) await notifyNames(added, { kind: "calendar", text: `${admin.name} invited you: ${item.title} · ${at}`, href }, admin, team);
      const moved = before && (before.date !== item.date || before.time !== item.time || before.location !== item.location);
      const kept = item.attendees.filter((n) => before?.attendees?.includes(n));
      if (moved && kept.length) await notifyNames(kept, { kind: "calendar", text: `Changed: ${item.title} is now ${at}${item.location ? `, ${item.location}` : ""}`, href }, admin, team);
      return Response.json({ item });
    }
    if (body.action === "delete") {
      const gone = await deleteItem(body.id, admin);
      if (gone) {
        await logAction(admin, `Deleted “${gone.title}” from the committee calendar`);
        if (gone.attendees?.length)
          await notifyNames(gone.attendees, { kind: "calendar", text: `Cancelled: ${gone.title} · ${describeWhen(gone.date, gone.time)}`, href: "/committee-calendar" }, admin, await listTeam().catch(() => []));
      }
      return Response.json({ ok: true });
    }
    if (body.action === "link") {
      if (admin.shared) return bad("Sign in with your own login to get a calendar link.");
      const token = await feedToken(admin.id, { reset: Boolean(body.reset) });
      if (body.reset) await logAction(admin, "Reset their committee calendar link");
      return Response.json({ url: new URL(`/api/committee-calendar/${token}`, siteUrl).toString() });
    }
  } catch (err) {
    return bad(err?.message || "That couldn’t be saved.");
  }
  return bad("Unknown action.");
}

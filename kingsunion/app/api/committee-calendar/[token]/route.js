// Someone's private committee calendar feed, to subscribe to from a phone or
// laptop calendar. The link itself is the password, so it's long and random,
// and can be reset in admin → Committee calendar. It shows the committee
// calendar, every debate and event, and the tasks they own or supervise.
import { adminForToken, listItems, combine, KINDS } from "@/lib/committee_calendar";
import { listTasks } from "@/lib/tasks";
import { listTeam } from "@/lib/team";
import { getEvents } from "@/lib/sheet";
import { sameName } from "@/lib/dashboard";
import { icsPrivate } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { token } = await params;
  const person = await adminForToken(String(token || "").replace(/\.ics$/, ""));
  if (!person) return new Response("Not found", { status: 404 });

  const [items, tasks, events, team] = await Promise.all([listItems(), listTasks().catch(() => []), getEvents().catch(() => []), listTeam().catch(() => [])]);
  // Their name as the login has it and as the team directory has it.
  const names = [person.name, ...team.filter((m) => sameName(m.name, person.name) || (m.email && m.email.toLowerCase() === String(person.email).toLowerCase())).map((m) => m.name)];
  const mine = (n) => names.some((x) => String(n || "").split(",").some((part) => sameName(part, x)));
  const theirTasks = tasks.filter((t) => mine(t.owner) || mine(t.supervisor));

  const admin = (path) => new URL(`/admin${path}`, siteUrl).toString();
  const entries = combine({ items, tasks: theirTasks, events }).map((e) => ({
    uid: e.key,
    title: e.source === "task" ? `Task due: ${e.title}` : e.title,
    date: e.date,
    time: e.time,
    endTime: e.endTime,
    minutes: e.source === "event" ? 120 : 60,
    location: e.location || "",
    description: [
      e.source === "committee" ? KINDS[e.kind] : "",
      e.notes || "",
      e.attendees?.length ? `Invited: ${e.attendees.join(", ")}` : "",
    ].filter(Boolean).join("\n\n"),
    url: e.source === "task" ? admin(`/dashboard?task=${e.id}`) : e.source === "event" ? new URL(`/events/${e.id}`, siteUrl).toString() : admin(`/committee-calendar?item=${e.id}`),
  }));

  return new Response(icsPrivate(entries, "King’s Union committee"), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" },
  });
}

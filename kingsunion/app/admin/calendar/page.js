import { readdir } from "node:fs/promises";
import path from "node:path";
import AdminShell from "@/components/voting/admin_shell";
import CalendarAdmin from "@/components/voting/calendar_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listEntries } from "@/lib/calendar_entries";
import { getEvents } from "@/lib/sheet";
import { tagForType } from "@/lib/calendar_tags";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calendar · Admin" };

async function sitePhotos() {
  try {
    const files = await readdir(path.join(process.cwd(), "public", "gallery"));
    return files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => `/gallery/${f}`);
  } catch {
    return [];
  }
}

export default async function CalendarAdminPage() {
  const base = await requireAdmin("calendar");
  const [entries, events, photos] = await Promise.all([listEntries(), getEvents().catch(() => []), sitePhotos()]);
  return (
    <AdminShell base={base} current="/calendar" wide>
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[#d4af37]">Term card</p>
        <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Calendar</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Add key dates, socials, deadlines and anything else to the calendar on the Term Card page. Debates from the
          term card spreadsheet are already on it.
        </p>
        <div className="mt-8">
          <CalendarAdmin
            base={base}
            initial={entries}
            photos={photos}
            events={events.map((e) => ({ slug: e.slug, title: e.title, date: e.date, time: e.time, venue: e.venue || "", tag: tagForType(e.type) }))}
          />
        </div>
      </div>
    </AdminShell>
  );
}

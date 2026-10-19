import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

const btn =
  "inline-flex items-center justify-center gap-2 border border-[#d4af37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200";

export default function AddToCalendar({ event, compact = false }) {
  const pageUrl = new URL(`/events/${event.slug}`, siteUrl).toString();
  return (
    <div>
      {!compact && (
        <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Add to calendar</p>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={googleCalendarUrl(event, pageUrl)} target="_blank" rel="noopener noreferrer" className={btn}>
          Google
        </a>
        <a href={`/events/${event.slug}/calendar.ics`} className={btn}>
          Apple / Outlook app
        </a>
        <a href={outlookCalendarUrl(event, pageUrl)} target="_blank" rel="noopener noreferrer" className={btn}>
          Outlook.com
        </a>
      </div>
    </div>
  );
}

import { subscribeLinks, itemFeedPath } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

const btn =
  "inline-flex items-center justify-center gap-2 border border-[#d4af37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200";

// Adds one event to someone's calendar as a live subscription, so if the time
// or venue changes, their calendar updates by itself.
export default function AddToCalendar({ event, compact = false }) {
  const links = subscribeLinks(siteUrl, itemFeedPath({ ...event, source: "termcard" }), `King’s Union: ${event.title}`);
  return (
    <div>
      {!compact && (
        <p className="text-xs uppercase tracking-widest text-white/50 mb-3">
          Add to calendar <span className="normal-case tracking-normal text-white/40">· updates if the time or venue changes</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={links.google} target="_blank" rel="noopener noreferrer" className={btn}>
          Google Calendar
        </a>
        <a href={links.webcal} className={btn}>
          Apple Calendar
        </a>
        <a href={links.outlook} target="_blank" rel="noopener noreferrer" className={btn}>
          Outlook
        </a>
      </div>
    </div>
  );
}

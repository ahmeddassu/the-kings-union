import { subscribeLinks } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";

const btn =
  "min-h-11 inline-flex items-center justify-center border border-[#d4af37] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200";

// "Add the whole term to your calendar": a subscription, so new and changed
// events appear in people's calendars by themselves.
export default function SubscribeCalendar() {
  const links = subscribeLinks(siteUrl);
  return (
    <section id="calendar" className="scroll-mt-24 bg-[#2a0101] text-white font-serif border-y border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 md:items-center">
        <div className="md:col-span-6">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-3">Never miss a debate</p>
          <h2 className="title text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Add the whole term to your calendar.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
            One tap and every debate is in your calendar. New events and any
            changes to times or venues appear by themselves.
          </p>
        </div>
        <div className="md:col-span-6 flex flex-wrap gap-2 md:justify-end">
          <a href={links.google} target="_blank" rel="noopener noreferrer" className={btn}>Google Calendar</a>
          <a href={links.webcal} className={btn}>Apple Calendar</a>
          <a href={links.outlook} target="_blank" rel="noopener noreferrer" className={btn}>Outlook</a>
        </div>
      </div>
    </section>
  );
}

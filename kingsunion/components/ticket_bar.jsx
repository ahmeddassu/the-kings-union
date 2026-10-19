import { getEvents } from "@/lib/sheet";
import { shortDate } from "@/lib/events";
import { ticketStatus } from "@/lib/tickets";

function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// A slim bar across the top of every page advertising the next event that has
// tickets on sale. Disappears by itself once that event has happened.
export default async function TicketBar() {
  const today = todayInLondon();
  const next = (await getEvents()).find((e) => e.tickets && e.date >= today);
  if (!next) return null;

  const isToday = next.date === today;
  const status = await ticketStatus(next);
  // On phones, drop "This House would" so the motion fits: "Abolish private schools"
  const short = next.title.replace(/^this house (would|believes|has)\s+/i, "");
  const shortTitle = short.charAt(0).toUpperCase() + short.slice(1);

  return (
    <a
      href={next.tickets}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#d4af37] text-[#3d0202] font-serif hover:bg-white transition-colors duration-200"
    >
      <div className="px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-4 text-sm sm:text-base">
        <p className="min-w-0 truncate">
          <span className="font-bold uppercase tracking-widest text-xs mr-2">
            {isToday ? "Tonight" : shortDate(next.date)}
          </span>
          <span className="italic sm:hidden">{shortTitle}</span>
          <span className="italic hidden sm:inline">“{next.title}”</span>
        </p>
        <span className="shrink-0 font-bold whitespace-nowrap">
          {status && (
            <span className="hidden md:inline text-xs uppercase tracking-widest mr-3 pr-3 border-r border-[#3d0202]/40">
              {status.label}
            </span>
          )}
          {status?.key === "soldout" ? "Join the waitlist" : "Get tickets"} <span aria-hidden="true" className="inline-block group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </div>
    </a>
  );
}

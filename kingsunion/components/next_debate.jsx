import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";
import { subscribeLinks, itemFeedPath } from "@/lib/calendar";
import { siteUrl } from "@/lib/site";
import { eventTimes } from "@/lib/calendar";
import { ticketStatus } from "@/lib/tickets";
import Countdown from "@/components/countdown";
import TicketBadge, { ticketButtonText } from "@/components/ticket_badge";

function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

export default async function NextDebate() {
  const today = todayInLondon();
  const next = (await getEvents()).find((e) => e.type === "Debate" && e.date >= today);
  if (!next) return null;

  const { start, end } = eventTimes(next);
  const status = await ticketStatus(next);

  return (
    <section className="bg-[#2a0101] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 md:items-end">
        <div className="md:col-span-8 min-w-0">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-3">
            Next debate
          </p>
          <a
            href={`/events/${next.slug}`}
            className="title block text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-balance hover:text-[#d4af37] transition-colors duration-200"
          >
            “{next.title}”
          </a>
          <p className="mt-3 text-base sm:text-lg text-white/75">
            {longDate(next.date)}, {next.time}
            {next.venue ? ` · ${next.venue}` : ""}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Countdown
              start={start.toISOString()}
              end={end.toISOString()}
              initialNow={Date.now()}
              className="text-base sm:text-lg font-bold text-white"
            />
            <TicketBadge status={status} />
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 md:items-stretch">
          {next.tickets && (
            <a
              href={next.tickets}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-12 inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base sm:text-lg font-bold hover:bg-white transition-colors duration-200"
            >
              {ticketButtonText(status)}
            </a>
          )}
          <a
            href={`/events/${next.slug}`}
            className={
              next.tickets
                ? "min-h-12 inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm sm:text-base font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
                : "min-h-12 inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-sm sm:text-base font-bold hover:bg-white transition-colors duration-200"
            }
          >
            Details →
          </a>
          <a
            href={subscribeLinks(siteUrl, itemFeedPath({ ...next, source: "termcard" }), `King’s Union: ${next.title}`).google}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-12 inline-flex items-center justify-center border border-[#d4af37] px-6 py-3 text-sm sm:text-base font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
          >
            Add to calendar
          </a>
        </div>
      </div>
    </section>
  );
}

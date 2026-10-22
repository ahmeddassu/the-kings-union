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

// "Next sitting": a cream card. On the homepage (`overlap`) it overlaps the bottom of the hero.
export default async function NextDebate({ overlap = false }) {
  const today = todayInLondon();
  const next = (await getEvents()).find((e) => e.type === "Debate" && e.date >= today);
  if (!next) return null;

  const { start, end } = eventTimes(next);
  const status = await ticketStatus(next);
  const outline =
    "min-h-12 inline-flex items-center justify-center border-2 border-[#3d0202] px-6 py-3 text-sm sm:text-base font-bold text-[#3d0202] hover:bg-[#3d0202] hover:text-[#f6efe2] transition-colors duration-200";

  return (
    <section
      aria-labelledby="next-sitting"
      className={`relative z-10 px-4 sm:px-6 md:px-8 font-serif ${overlap ? "-mt-32 sm:-mt-36 md:-mt-40" : "bg-[#3d0202] py-8 sm:py-10"}`}
    >
      <div className={`${overlap ? "enter-rise" : ""} border-t-[6px] border-[#d4af37] bg-[#f6efe2] text-[#3d0202] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]`} style={{ "--delay": "0.7s" }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 p-6 sm:p-8 md:p-10 md:items-end">
          <div className="md:col-span-8 min-w-0">
            <p id="next-sitting" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm uppercase tracking-[0.25em] font-bold text-[#8a6d12]">
              Next sitting
              <TicketBadge status={status} onGold />
            </p>
            <a
              href={`/events/${next.slug}`}
              className="title mt-3 block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic leading-[1.02] text-balance hover:text-[#7a0a0a] transition-colors duration-200"
            >
              “{next.title}”
            </a>
            <p className="mt-4 text-base sm:text-lg text-[#3d0202]/80">
              {longDate(next.date)}, {next.time}
              {next.venue ? ` · ${next.venue}` : ""}
              <Countdown
                start={start.toISOString()}
                end={end.toISOString()}
                initialNow={Date.now()}
                className="ml-3 font-bold text-[#3d0202]"
              />
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 md:items-stretch">
            {next.tickets && (
              <a
                href={next.tickets}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-12 inline-flex items-center justify-center bg-[#3d0202] text-[#f6efe2] px-6 py-3 text-base sm:text-lg font-bold hover:bg-[#7a0a0a] transition-colors duration-200"
              >
                {status?.key === "soldout" ? ticketButtonText(status) : "Reserve a seat →"}
              </a>
            )}
            <a href={`/events/${next.slug}`} className={outline}>
              The motion in full
            </a>
            <a
              href={subscribeLinks(siteUrl, itemFeedPath({ ...next, source: "termcard" }), `King’s Union: ${next.title}`).google}
              target="_blank"
              rel="noopener noreferrer"
              className={outline}
            >
              Add to calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

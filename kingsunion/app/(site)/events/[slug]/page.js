import { notFound } from "next/navigation";
import { eventSchema } from "@/lib/event_schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoSlot from "@/components/photo_slot";
import AddToCalendar from "@/components/add_to_calendar";
import { longDate, isMotion } from "@/lib/events";
import { getEvents } from "@/lib/sheet";
import { eventTimes } from "@/lib/calendar";
import { ticketStatus } from "@/lib/tickets";
import Countdown from "@/components/countdown";
import TicketBadge, { ticketButtonText } from "@/components/ticket_badge";

// New rows added to the sheet get a page without a redeploy.
export const dynamicParams = true;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const events = await getEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) return {};
  const parts = [`${longDate(event.date)}, ${event.time}`];
  if (event.venue) parts.push(event.venue);
  let description = parts.join(" · ") + ".";
  if (event.result) {
    const { proposition: p, opposition: o } = event.result;
    description += ` Ayes ${p}, Noes ${o}: motion ${p > o ? "carried" : "defeated"}.`;
  } else if (event.description) {
    description += ` ${event.description}`;
  }
  const title = event.type === "Debate" ? `“${event.title}”` : event.title;
  // The share picture itself is drawn by opengraph-image.js in this folder.
  return {
    title,
    description,
    openGraph: { type: "article", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

function SpeakerList({ side, names }) {
  if (!names || !names.length) return null;
  return (
    <div className="border-t border-[#d4af37] pt-4">
      <h3 className="text-xs uppercase tracking-widest text-[#d4af37] mb-3">
        {side}
      </h3>
      <ul className="space-y-1 text-base sm:text-lg">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  const events = await getEvents();
  const index = events.findIndex((e) => e.slug === slug);
  if (index === -1) notFound();

  const event = events[index];
  const info = event;
  const prev = events[index - 1];
  const next = events[index + 1];
  const motion = isMotion(event);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const hasHappened = event.date < today;
  const { start, end } = eventTimes(event);
  const status = hasHappened ? null : await ticketStatus(event);

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema(event)).replace(/</g, "\\u003c") }} />

        {/* Header */}
        <section className="relative overflow-hidden border-b border-[#d4af37]">
          {event.background && (
            <>
              <img
                src={event.background}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover opacity-35 pointer-events-none select-none ${{ center: "object-center", left: "object-left" }[event.backgroundPosition] || "object-right"} ${event.backgroundBlur ? "blur-2xl scale-110" : ""}`}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#3d0202] via-[#3d0202]/80 to-[#3d0202]/30 pointer-events-none"
              />
              {event.backgroundCredit &&
                (event.backgroundCredit.href ? (
                  <a
                    href={event.backgroundCredit.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-1 right-3 left-3 z-10 py-1 text-right text-[11px] text-white/50 hover:text-white"
                  >
                    {event.backgroundCredit.text}
                  </a>
                ) : (
                  <p className="absolute bottom-2 right-3 left-3 z-10 text-right text-[11px] text-white/50">
                    {event.backgroundCredit.text}
                  </p>
                ))}
            </>
          )}
          <div className="relative px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <a
              href="/term-card"
              className="inline-flex items-center min-h-11 -my-2 text-sm text-white/60 hover:text-[#d4af37] mb-6 transition-colors"
            >
              ← Term Card
            </a>

            {/* Text on the left; a film poster (if any) sits in its own column on the right, or above on phones */}
            <div className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-8 md:gap-12">
            <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-5 text-[#d4af37]">
              {event.type}
            </p>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-4xl text-balance">
              {motion ? `“${event.title}”` : event.type === "Film Screening" ? <em>{event.title}</em> : event.title}
            </h1>

            <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl text-sm sm:text-base">
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Date</dt>
                <dd>{longDate(event.date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Time</dt>
                <dd className="tabular-nums">{event.time}</dd>
              </div>
              {info.venue && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-white/50 mb-1">Venue</dt>
                  <dd>{info.venue}</dd>
                </div>
              )}
            </dl>

            {!hasHappened && (
              <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Countdown
                  start={start.toISOString()}
                  end={end.toISOString()}
                  initialNow={Date.now()}
                  className="text-lg sm:text-xl font-bold"
                />
                <TicketBadge status={status} />
              </p>
            )}

            {!hasHappened && event.tickets && (
              <a
                href={event.tickets}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full sm:w-auto min-h-12 inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-8 py-3.5 text-lg font-bold hover:bg-white transition-colors duration-200"
              >
                {ticketButtonText(status)}
              </a>
            )}

            {!hasHappened && (
              <div className="mt-8">
                <AddToCalendar event={event} />
              </div>
            )}
            </div>

            {event.poster && (
              <img
                src={event.poster}
                alt={`${event.title} poster`}
                className="block w-40 sm:w-48 md:w-60 shrink-0 self-start border border-[#d4af37] shadow-2xl"
              />
            )}
            </div>
          </div>
        </section>

        {/* Photo: shown once there is one, or as a placeholder after the event */}
        {info.photo && (
          <section className="border-b border-[#d4af37]">
            <PhotoSlot
              src={info.photo}
              alt={event.title}
              aspect="aspect-[3/2] max-h-[75vh]"
              className="border-0"
            />
          </section>
        )}

        {/* Body */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">

            <div className="md:col-span-7 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">
                {motion ? "About the motion" : "About the event"}
              </h2>
              <div className="max-w-prose text-base sm:text-lg leading-relaxed text-white/85">
                {info.description && <p>{info.description}</p>}
              </div>
            </div>

            {motion && (info.chathamHouse || info.result || info.proposition?.length > 0 || info.opposition?.length > 0) && (
              <aside className="md:col-span-5 min-w-0 space-y-8">
                {info.chathamHouse ? (
                  <div className="border-t border-[#d4af37] pt-4">
                    <h3 className="text-xs uppercase tracking-widest text-[#d4af37] mb-3">
                      Speakers
                    </h3>
                    <p className="text-white/70">
                      Held under the Chatham House Rule, so speakers are not named.
                    </p>
                  </div>
                ) : (info.proposition?.length > 0 || info.opposition?.length > 0) ? (
                  <div className="grid grid-cols-2 gap-6">
                    <SpeakerList side="Proposition" names={info.proposition} />
                    <SpeakerList side="Opposition" names={info.opposition} />
                  </div>
                ) : null}

                {info.result && (
                <div className="border-t border-b border-[#d4af37] py-4 flex items-center justify-between">
                  <span className="font-bold">Result</span>
                  {info.result ? (
                    <span className="text-right">
                      <span className="block text-[#d4af37] font-bold tabular-nums">
                        Ayes {info.result.proposition} · Noes {info.result.opposition}
                      </span>
                      <span className="block text-xs uppercase tracking-widest text-white/60 mt-1">
                        {info.result.proposition > info.result.opposition
                          ? "Motion carried"
                          : "Motion defeated"}
                      </span>
                    </span>
                  ) : null}
                </div>
                )}
              </aside>
            )}
          </div>
        </section>

        {/* Prev / next */}
        <nav className="border-t border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-8 grid grid-cols-2 gap-6 text-sm sm:text-base">
            <div className="min-w-0">
              {prev && (
                <a href={`/events/${prev.slug}`} className="group block">
                  <span className="block text-xs uppercase tracking-widest text-white/50 mb-1">← Previous</span>
                  <span className="group-hover:text-[#d4af37] transition-colors">{prev.title}</span>
                </a>
              )}
            </div>
            <div className="min-w-0 text-right">
              {next && (
                <a href={`/events/${next.slug}`} className="group block">
                  <span className="block text-xs uppercase tracking-widest text-white/50 mb-1">Next →</span>
                  <span className="group-hover:text-[#d4af37] transition-colors">{next.title}</span>
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* Phones: ticket button pinned to the bottom of the screen */}
        {!hasHappened && event.tickets && (
          <>
            <div className="h-20 md:hidden" aria-hidden="true" />
            <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#d4af37] bg-[#3d0202]/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <a
                href={event.tickets}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-3 bg-[#d4af37] text-[#3d0202] text-lg font-bold"
              >
                {status && <TicketBadge status={status} onGold />}
                {ticketButtonText(status)}
              </a>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

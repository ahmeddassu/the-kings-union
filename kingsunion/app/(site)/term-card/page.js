import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import MailingList from "@/components/mailing_list";
import SubscribeCalendar from "@/components/subscribe_calendar";
import { termName, shortDate, isMotion } from "@/lib/events";
import { getEvents } from "@/lib/sheet";

export const metadata = { title: "Term Card" };

export default async function TermCardPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Header */}
        <section className="border-b border-[#D4AF37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
              {termName}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
              Term Card
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
              Our programme of debates and events for the term. Tap any
              event for details.
            </p>
          </div>
        </section>

        <PhotoBand src="/gallery/chapel-empty.jpg" alt="The College Chapel set for a debate" position="center 55%" />

        {/* Term Card */}
        <section className="relative overflow-hidden">
          <img
            src="/KUArmsFinal.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -left-24 top-10 w-[28rem] sm:w-[36rem] max-w-none opacity-[0.06]"
          />

          <div className="relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">
            <ol className="mx-auto max-w-3xl">
              {events.map((event) => (
                <li key={event.slug}>
                  <a
                    href={`/events/${event.slug}`}
                    className="group grid grid-cols-[6.5rem_1fr_auto] sm:grid-cols-[10rem_1fr_auto] gap-x-4 sm:gap-x-6 py-4 sm:py-5 border-b border-white/10 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37] transition-colors"
                  >
                    <span className="text-right border-r border-white pr-4 sm:pr-6 leading-tight">
                      <span className="block text-base sm:text-xl">
                        {shortDate(event.date)}
                      </span>
                      <span className="block text-base sm:text-xl tabular-nums">
                        {event.time}
                      </span>
                    </span>

                    <span className="text-base sm:text-xl leading-snug group-hover:text-[#d4af37] transition-colors">
                      {isMotion(event) ? (
                        <>Debate: “{event.title}”</>
                      ) : event.type === "Film Screening" ? (
                        <>Film Screening: <em>{event.title}</em></>
                      ) : (
                        event.title
                      )}
                    </span>

                    <span
                      aria-hidden="true"
                      className="self-center text-[#d4af37] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <SubscribeCalendar />
        <MailingList />
      </main>

      <Footer />
    </>
  );
}

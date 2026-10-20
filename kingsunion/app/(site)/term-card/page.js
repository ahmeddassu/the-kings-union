import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PhotoBand from "@/components/photo_band";
import MailingList from "@/components/mailing_list";
import SubscribeCalendar from "@/components/subscribe_calendar";
import TermCalendar from "@/components/term_calendar";
import { termName, shortDate } from "@/lib/events";
import { getCalendarItems } from "@/lib/calendar_entries";
import { subscribeLinks, itemFeedPath } from "@/lib/calendar";
import { tagFor } from "@/lib/calendar_tags";
import { siteUrl } from "@/lib/site";

export const metadata = { title: "Term Card" };
export const revalidate = 60;

function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// The plain term card: every entry in date order.
function TermList({ items }) {
  return (
    <ol className="mx-auto max-w-3xl">
      {items.map((item) => {
        const inner = (
          <>
            <span className="text-right border-r border-white pr-4 sm:pr-6 leading-tight">
              <span className="block text-base sm:text-xl">{shortDate(item.date)}</span>
              <span className="block text-base sm:text-xl tabular-nums">{item.allDay ? "All day" : item.time}</span>
            </span>
            <span className="text-base sm:text-xl leading-snug group-hover:text-[#d4af37] transition-colors">
              <span className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-white/55">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: tagFor(item.tag).colour }} />
                {tagFor(item.tag).label}
              </span>
              {item.type === "Debate" ? (
                <>Debate: “{item.title}”</>
              ) : item.type === "Film Screening" ? (
                <>Film Screening: <em>{item.title}</em></>
              ) : (
                item.title
              )}
            </span>
            <span aria-hidden="true" className="self-center text-[#d4af37] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition">
              {item.href ? "→" : ""}
            </span>
          </>
        );
        const cls =
          "group grid grid-cols-[6.5rem_1fr_auto] sm:grid-cols-[10rem_1fr_auto] gap-x-4 sm:gap-x-6 py-4 sm:py-5 border-b border-white/10";
        return (
          <li key={item.id}>
            {item.href ? (
              <a href={item.href} className={`${cls} hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37] transition-colors`}>
                {inner}
              </a>
            ) : (
              <div className={cls}>{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default async function TermCardPage() {
  const today = todayInLondon();
  const raw = await getCalendarItems();
  const items = raw.map((item) => {
    const sub = subscribeLinks(siteUrl, itemFeedPath(item), `King’s Union: ${item.title}`);
    return { ...item, links: { google: sub.google, outlook: sub.outlook, ics: sub.webcal } };
  });
  const next = items.find((i) => (i.endDate || i.date) >= today);
  const startMonth = (next ? next.date : today).slice(0, 7);
  const list = <TermList items={items} />;

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
              event for details, or switch to the list.
            </p>
          </div>
        </section>

        <PhotoBand src="/gallery/chapel-empty.jpg" alt="The College Chapel set for a debate" position="center 55%" />

        {/* Term Card: calendar, with the plain list one tap away */}
        <section className="relative overflow-hidden">
          <img
            src="/KUArmsFinal.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -left-24 top-10 w-[28rem] sm:w-[36rem] max-w-none opacity-[0.06]"
          />

          <div className="relative px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">
            <TermCalendar items={items} today={today} startMonth={startMonth} list={list} />
            <noscript>{list}</noscript>
          </div>
        </section>

        <SubscribeCalendar />
        <MailingList />
      </main>

      <Footer />
    </>
  );
}

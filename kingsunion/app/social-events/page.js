import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const upcomingEvents = [
  {
    title: "Welcome Drinks",
    date: "19 September 2026",
    time: "7:00 PM",
    location: "TBC",
    description:
      "Meet the committee and fellow members for an informal evening to kick off the new academic year.",
  },
  {
    title: "Union Pub Crawl",
    date: "26 September 2026",
    time: "8:00 PM",
    location: "Central London",
    description:
      "An evening of questionable decisions and considerably better company. Open to all members.",
  },
  {
    title: "Film Night",
    date: "3 October 2026",
    time: "6:30 PM",
    location: "King's College London",
    description:
      "A relaxed evening with a film chosen by the membership, followed by drinks and discussion.",
  },
];

const pastEvents = [
  {
    title: "End of Term Social",
    date: "June 2026",
    description:
      "A final evening together to celebrate the end of the Union's inaugural year.",
  },
  {
    title: "Spring Pub Crawl",
    date: "April 2026",
    description:
      "Members from across the Union came together for an evening across central London.",
  },
  {
    title: "Movie Night",
    date: "March 2026",
    description:
      "An informal evening away from the debating chamber, with members voting on the night's film.",
  },
];

export default function SocialEventsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-black font-serif">

        {/* Hero */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">

            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6">
              Beyond Debate
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Social
              <br />
              events.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed">
              Debate is only half the story. From pub crawls to film nights,
              the Union is a place to meet people, make friends and spend time
              outside the chamber.
            </p>

          </div>
        </section>

        {/* Upcoming events */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

            <div className="flex items-end justify-between border-b border-black pb-4 mb-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Upcoming events
              </h2>

              <span className="hidden sm:block text-xs sm:text-sm text-gray-500">
                What's next
              </span>
            </div>

            <div>
              {upcomingEvents.map((event, index) => (
                <article
                  key={event.title}
                  className="border-b border-black py-7 sm:py-9"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8">

                    {/* Number */}
                    <div className="md:col-span-1">
                      <span className="text-xs text-gray-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Event */}
                    <div className="md:col-span-6">
                      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-gray-500">
                        {event.date} · {event.time}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-5">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {event.description}
                      </p>

                      <p className="mt-4 text-xs sm:text-sm font-semibold">
                        {event.location}
                      </p>
                    </div>

                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* Social philosophy */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-5">
                  Outside the chamber
                </p>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                  Come for the
                  <br />
                  debate.
                  <br />
                  Stay for the people.
                </h2>
              </div>

              <div className="space-y-6 text-base sm:text-lg leading-relaxed">
                <p>
                  The Union is as much a social community as it is a debating
                  society. Our events are designed to give members a chance to
                  get to know one another away from the formality of the
                  chamber.
                </p>

                <p>
                  Some events are organised around the Union's programme, while
                  others are simply an excuse to get everyone together for an
                  evening.
                </p>

                <p>
                  You don't need to be an experienced debater to come along.
                  Turn up, bring a friend, and get involved.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Past events */}
        <section className="border-b border-black">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

            <div className="mb-10 sm:mb-14">
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-4">
                The archive
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Past socials.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">

              {pastEvents.map((event) => (
                <article
                  key={event.title}
                  className="border-t border-black pt-4"
                >
                  <p className="text-xs text-gray-500 mb-3">
                    {event.date}
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                    {event.title}
                  </h3>

                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </article>
              ))}

            </div>

          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4">
                  Get involved
                </p>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
                  See you there.
                </h2>
              </div>

              <a
                href="contact"
                className="inline-flex items-center justify-center border border-black px-6 py-3 text-sm font-bold hover:bg-black hover:text-white transition-colors"
              >
                Join the Union →
              </a>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
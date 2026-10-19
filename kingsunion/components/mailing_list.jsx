// Ticket alerts: people leave their email to hear when tickets go on sale.
// Each sign-up is emailed to the Union (see app/api/contact/route.js).
// Works without JavaScript.
export default function MailingList({ id = "mailing-list" }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#3d0202] text-white font-serif border-t border-[#d4af37]"
    >
      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:items-end">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-3">
            Ticket alerts
          </p>
          <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Be first for tickets.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/75 leading-relaxed">
            Leave your email and we’ll tell you as soon as tickets for each
            debate go on sale. Popular debates fill up fast.
          </p>
        </div>

        <form
          action="/api/contact"
          method="post"
          className="w-full max-w-xl"
        >
          <input type="hidden" name="team" value="alerts" />
          {/* Spam trap: hidden from people, filled in by bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <label htmlFor={`${id}-email`} className="block text-xs uppercase tracking-widest mb-2 text-[#d4af37]">
            Your email
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@kcl.ac.uk"
              className="flex-1 min-w-0 min-h-12 bg-transparent border border-[#d4af37] px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white"
            />
            <button
              type="submit"
              className="min-h-12 bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200 whitespace-nowrap"
            >
              Notify me →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

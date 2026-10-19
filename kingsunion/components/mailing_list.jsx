import { UNION_NEWSLETTER_URL } from "@/lib/nav";

// The Union mailing list. Runs on Substack (free, handles sending and
// unsubscribing). The form opens Substack's subscribe page with the email
// filled in, and Substack asks the reader to confirm. Works without JavaScript.
export default function MailingList({ id = "mailing-list" }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#3d0202] text-white font-serif border-t border-[#d4af37]"
    >
      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 lg:items-end">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-3">
            Mailing list
          </p>
          <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Never miss a motion.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/75 leading-relaxed">
            One email before each debate: the motion, the speakers and where to
            be. Free, and you can unsubscribe any time.
          </p>
        </div>

        <form
          action={new URL("subscribe", UNION_NEWSLETTER_URL).toString()}
          method="get"
          target="_blank"
          className="w-full max-w-xl"
        >
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
              Sign up →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

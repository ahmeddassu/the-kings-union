import { KINGSWAY_URL } from "@/lib/nav";

// Opens Kingsway's Substack subscribe page with the reader's email filled in;
// Substack asks them to confirm there.
export default function KingswaySubscribe() {
  return (
    <form
      action={new URL("subscribe", KINGSWAY_URL).toString()}
      method="get"
      target="_blank"
      className="w-full max-w-xl"
    >
      <label htmlFor="kingsway-email" className="block text-sm text-white/75 mb-2">
        Get every new piece in your inbox. Free, and you can unsubscribe any time.
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="kingsway-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@kcl.ac.uk"
          className="flex-1 min-w-0 bg-transparent border border-[#d4af37] px-4 py-3 text-base text-white placeholder:text-white/40 outline-none focus:border-white"
        />
        <button
          type="submit"
          className="bg-[#d4af37] text-[#3d0202] px-6 py-3 text-base font-bold hover:bg-white transition-colors duration-200 whitespace-nowrap"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}

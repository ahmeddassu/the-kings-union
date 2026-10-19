import { MEMBERSHIP_URL } from "@/lib/nav";

export default function JoinBand() {
  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-1">
            Membership
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold leading-snug">
            Join the King’s Union and have your say in the chamber.
          </p>
          <a href="/membership" className="mt-1 inline-flex min-h-11 items-center text-sm sm:text-base font-bold text-[#d4af37] hover:text-white transition-colors">
            See member benefits →
          </a>
        </div>

        <a
          href={MEMBERSHIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-3 text-sm sm:text-base font-bold hover:bg-white transition-colors duration-200"
        >
          Become a member →
        </a>
      </div>
    </section>
  );
}

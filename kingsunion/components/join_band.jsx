import { MEMBERSHIP_URL } from "@/lib/nav";

export default function JoinBand() {
  return (
    <section className="bg-[linear-gradient(100deg,#b8892b,#e9c964_30%,#d4af37_55%,#f3dc8c_75%,#b8892b)] text-[#3d0202] font-serif">
      <div className="reveal px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
        <div>
          <p className="title-sc text-base sm:text-lg tracking-[0.12em] font-bold">Membership</p>
          <p className="title mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
            Join the King’s Union and have your say in the chamber.
          </p>
          <a href="/membership" className="mt-3 inline-flex min-h-11 items-center text-base font-bold underline underline-offset-4 hover:text-[#7a0a0a]">
            See member benefits →
          </a>
        </div>

        <a
          href={MEMBERSHIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-14 shrink-0 items-center justify-center bg-[#3d0202] text-[#f6efe2] px-8 py-3 text-base sm:text-lg font-bold hover:bg-[#140000] transition-colors duration-200"
        >
          Become a member →
        </a>
      </div>
    </section>
  );
}

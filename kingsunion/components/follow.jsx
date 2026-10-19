// "Follow us": one card per channel, with what we post there.
const socials = [
  {
    name: "Instagram",
    handle: "@thekingsunion",
    href: "https://www.instagram.com/thekingsunion",
    blurb: "Motions, speakers and photos from the night.",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
      </>
    ),
  },
  {
    name: "YouTube",
    handle: "@TheKingsUnionSociety",
    href: "https://www.youtube.com/@TheKingsUnionSociety",
    blurb: "Full debates and the best speeches.",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 8.5 L16 12 L10 15.5 Z" fill="currentColor" />
      </>
    ),
  },
  {
    name: "TikTok",
    handle: "@the.kings.union",
    href: "https://www.tiktok.com/@the.kings.union",
    blurb: "Clips, comebacks and chamber highlights.",
    icon: (
      <path
        d="M14 3v11.2a3.3 3.3 0 1 1-3.3-3.3M14 3c.4 2.6 2.2 4.4 5 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: "LinkedIn",
    handle: "The King’s Union",
    href: "https://www.linkedin.com/company/109812004/",
    blurb: "News, partners and opportunities.",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7.5 10.5v6M7.5 7.6v.1M11 16.5v-6M11 13c0-1.6 1-2.6 2.4-2.6s2.1 1 2.1 2.6v3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

export default function FollowUs() {
  return (
    <section
      id="follow"
      className="relative isolate overflow-clip bg-[#3d0202] text-white font-serif border-t border-[#d4af37]"
    >
      {/* Big faded handle in the background */}
      <p
        aria-hidden="true"
        className="title pointer-events-none absolute -bottom-6 sm:-bottom-10 right-0 -z-10 select-none whitespace-nowrap text-[18vw] sm:text-[12vw] font-bold leading-none text-[#d4af37]/[0.06]"
      >
        @thekingsunion
      </p>

      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Follow us</p>
            <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              The debate doesn’t
              <br className="hidden sm:block" /> end in the chamber.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-white/75 max-w-md leading-relaxed">
            Keep up with upcoming debates, events, competitions and life at the Union.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative isolate overflow-clip flex h-full flex-col border border-[#d4af37] bg-[#3d0202]/60 p-4 sm:p-6 text-white transition-colors duration-200 hover:bg-[#d4af37] hover:text-[#3d0202] focus-visible:bg-[#d4af37] focus-visible:text-[#3d0202]"
              >
                {/* Large see-through logo behind the card */}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -bottom-8 -z-10 h-44 w-44 sm:h-52 sm:w-52 text-[#d4af37] opacity-[0.12] transition-[color,opacity,transform] duration-300 group-hover:text-[#3d0202] group-hover:opacity-[0.15] group-hover:scale-105 group-focus-visible:text-[#3d0202]"
                >
                  {s.icon}
                </svg>
                <div className="flex items-start justify-between">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 text-[#d4af37] transition-colors group-hover:text-[#3d0202] group-focus-visible:text-[#3d0202]">
                    {s.icon}
                  </svg>
                  <span aria-hidden="true" className="text-xl transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>
                <p className="mt-4 sm:mt-8 text-2xl font-bold">{s.name}</p>
                <p className="mt-1 text-sm text-white/60 transition-colors group-hover:text-[#3d0202]/75 group-focus-visible:text-[#3d0202]/75 break-all">
                  {s.handle}
                </p>
                <p className="mt-2 sm:mt-4 text-sm sm:text-base leading-relaxed text-white/80 transition-colors group-hover:text-[#3d0202] group-focus-visible:text-[#3d0202]">
                  {s.blurb}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

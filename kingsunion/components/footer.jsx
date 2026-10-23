import { MEMBERSHIP_URL } from "@/lib/nav";

const linkClass =
  "inline-block py-1.5 sm:py-1 text-white/85 hover:text-[#d4af37] transition-colors duration-200";

// The footer's links, in groups. Add new pages to whichever group fits.
const groups = [
  {
    title: "The Union",
    links: [
      ["/about", "About"],
      ["/governance", "Governance"],
      ["/kingsway", "Kingsway", { italic: true }],
      ["/press", "Press"],
      ["/support", "Support us"],
      ["/friends", "Friends of the Union"],
    ],
  },
  {
    title: "Debates",
    links: [
      ["/term-card", "Term Card"],
      ["/term-card#calendar", "Calendar"],
      ["/debates", "Past debates"],
      ["/votes", "How King’s votes"],
      ["/records", "Records"],
      ["/speakers", "Past speakers"],
    ],
  },
  {
    title: "Take part",
    links: [
      ["/membership", "Membership"],
      [MEMBERSHIP_URL, "Join us", { external: true }],
      ["/get-involved", "Get involved"],
      ["/speak", "Speak at the Union"],
      ["/speak/apply", "Apply to speak"],
      ["/motions", "Suggest a motion"],
      ["/guide", "How to debate"],
      ["/#mailing-list", "Ticket alerts"],
    ],
  },
  {
    title: "Help",
    links: [
      ["/#faq", "FAQ"],
      ["/search", "Search"],
      ["/contact", "Contact us"],
      ["/privacy", "Privacy"],
      // For the committee: straight to admin sign-in
      ["https://admin.kingsunion.org.uk", "Committee login", { nofollow: true }],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <a
            href="/"
            className="title inline-block py-1 text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap hover:text-[#d4af37] transition-colors duration-200"
          >
            <span className="italic">the</span>{" "}King’s Union
          </a>
          <p className="mt-2 text-sm text-white/60">The debating society at King’s College London.</p>
        </div>

        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`footer-${g.title.replace(/\s+/g, "-").toLowerCase()}`}>
              <h2
                id={`footer-${g.title.replace(/\s+/g, "-").toLowerCase()}`}
                className="font-serif text-xs uppercase tracking-widest text-[#d4af37]"
                style={{ letterSpacing: "0.15em" }}
              >
                {g.title}
              </h2>
              <ul className="mt-3 space-y-0.5 text-base sm:text-sm">
                {g.links.map(([href, label, opts = {}]) => (
                  <li key={href + label}>
                    <a
                      href={href}
                      className={linkClass}
                      {...(opts.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      {...(opts.nofollow ? { rel: "nofollow" } : {})}
                    >
                      {opts.italic ? <em>{label}</em> : label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}

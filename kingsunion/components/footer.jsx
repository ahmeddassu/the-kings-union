import { navLinks, MEMBERSHIP_URL } from "@/lib/nav";

const linkClass =
  "inline-block py-2 sm:py-0 text-white/85 hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200";

export default function Footer() {
  const pages = navLinks.filter((l) => l.href !== "/");

  return (
    <footer className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-10 px-4 sm:px-6 md:px-8 py-10 md:py-12">

        <a
          href="/"
          className="title inline-block py-1 text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap hover:text-[#d4af37] transition-colors duration-200"
        >
          <span className="italic">the</span>{" "}King’s Union
        </a>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 sm:gap-x-16 gap-y-1 sm:gap-y-3 text-base sm:text-sm">
          {pages.map((link) => (
            <a key={link.href} href={link.href} className={linkClass}>
              {link.italic ? <em>{link.label}</em> : link.label}
            </a>
          ))}
          <a href="/speak" className={linkClass}>
            Speak at the Union
          </a>
          <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Join us
          </a>
          <a href="/motions" className={linkClass}>
            Suggest a motion
          </a>
          <a href="/speak/apply" className={linkClass}>
            Apply to speak
          </a>
          <a href="/get-involved" className={linkClass}>
            Get involved
          </a>
          <a href="/#mailing-list" className={linkClass}>
            Ticket alerts
          </a>
          <a href="/votes" className={linkClass}>
            How King’s votes
          </a>
          <a href="/press" className={linkClass}>
            Press
          </a>
          <a href="/#faq" className={linkClass}>
            FAQ
          </a>
          <a href="/term-card#calendar" className={linkClass}>
            Calendar
          </a>
          <a href="/contact" className={linkClass}>
            Contact us
          </a>
          <a href="/privacy" className={linkClass}>
            Privacy
          </a>
        </div>

      </div>
    </footer>
  );
}

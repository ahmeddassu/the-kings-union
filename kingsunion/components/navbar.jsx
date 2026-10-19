"use client";

import { useEffect, useState } from "react";
import { navLinks, socialLinks, MEMBERSHIP_URL } from "@/lib/nav";

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="4"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.6"
      />
      <path d="M10 8.5 L16 12 L10 15.5 Z" fill="#d4af37" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.6"
      />
      <circle cx="17.3" cy="6.7" r="1.1" fill="#d4af37" />
    </svg>
  );
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M15.5 4.5c.4 2.1 1.6 3.4 3.5 3.8v2.7c-1.3-.1-2.5-.5-3.5-1.2v5.1c0 3.2-2.2 5.1-5.1 5.1-2.7 0-4.7-1.8-4.7-4.3 0-2.7 2.2-4.6 5-4.6.4 0 .8 0 1.2.1v2.7c-.4-.1-.7-.2-1.1-.2-1.2 0-2.2.8-2.2 1.9 0 1 .8 1.7 1.8 1.7 1.2 0 2.2-.7 2.2-2.4V4.5h2.9Z"
        fill="#d4af37"
      />
    </svg>
  );
}

const icons = { YouTube: YouTubeIcon, Instagram: InstagramIcon, TikTok: TikTokIcon };

function Label({ link }) {
  return link.italic ? <em>{link.label}</em> : link.label;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
      <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" />
      <path className="hidden group-open:inline" d="M6 6l12 12M18 6L6 18" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconSize = scrolled ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7";
  const logoTextSize = scrolled ? "text-xl md:text-lg" : "text-[1.7rem] md:text-5xl";
  const rowPad = scrolled ? "py-2 md:py-1.5" : "py-3 md:py-5";
  const sideLinkSize = scrolled ? "text-[11px]" : "text-sm";
  const linkClass =
    "text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200";

  return (
    <div className="sticky top-0 z-50 bg-[#3d0202] font-serif">

      {/* Top row */}
      <header className="border-t border-b border-[#d4af37]">
        <div
          className={`flex items-center justify-between gap-4 md:gap-10 px-4 sm:px-6 md:px-8 transition-all duration-300 ease-out ${rowPad}`}
        >

          {/* Social icons (desktop) */}
          <div className="hidden md:flex items-center gap-4 flex-none">
            {socialLinks.map((s) => {
              const Icon = icons[s.label];
              return (
                <a key={s.label} href={s.href} aria-label={s.label} className="flex items-center">
                  <Icon className={`${iconSize} transition-all duration-300`} />
                </a>
              );
            })}
          </div>

          {/* Wordmark: left on phones, centred on desktop */}
          <div className="flex-1 flex md:justify-center min-w-0">
            <a
              href="/"
              aria-label="King’s Union home"
              className={`title ${logoTextSize} font-bold tracking-tight whitespace-nowrap text-white hover:text-[#d4af37] transition-all duration-300`}
            >
              <span className="italic">the</span>{" "}King’s Union
            </a>
          </div>

          {/* Join / Contact (desktop) */}
          <div className={`hidden md:flex items-center gap-3 flex-none ${sideLinkSize} transition-all duration-300`}>
            <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Join Us
            </a>
            <span className="text-[#d4af37]">|</span>
            <a href="/contact" className={linkClass}>
              Contact Us
            </a>
          </div>

          {/* Phone menu: a native <details> toggle, so it works even before scripts load */}
          <details className="md:hidden group flex-none">
            <summary
              aria-label="Menu"
              className="list-none [&::-webkit-details-marker]:hidden -mr-2 p-2 rounded-md cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37]"
            >
              <MenuIcon />
            </summary>

            <div className="absolute left-0 right-0 top-full h-[100dvh] bg-[#3d0202] overflow-y-auto overscroll-contain border-t border-[#d4af37]">
              <nav aria-label="Menu" className="px-4 sm:px-6 pt-2 pb-40">
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.href} className="border-b border-[#d4af37]/30">
                      <a
                        href={link.href}
                        className="title flex items-center justify-between py-4 text-3xl font-bold text-white active:text-[#d4af37]"
                      >
                        <Label link={link} />
                        <span aria-hidden="true" className="text-[#d4af37] text-xl font-normal">→</span>
                      </a>
                    </li>
                  ))}
                </ul>

                <a
                  href={MEMBERSHIP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center bg-[#d4af37] text-[#3d0202] px-6 py-4 text-base font-bold"
                >
                  Become a member →
                </a>

                <a
                  href="/contact"
                  className="mt-3 flex items-center justify-center border border-[#d4af37] px-6 py-4 text-base font-bold text-white"
                >
                  Contact us
                </a>

                <div className="mt-8 flex items-center justify-center gap-8">
                  {socialLinks.map((sl) => {
                    const Icon = icons[sl.label];
                    return (
                      <a key={sl.label} href={sl.href} aria-label={sl.label} className="p-1">
                        <Icon className="w-8 h-8" />
                      </a>
                    );
                  })}
                </div>
              </nav>
            </div>
          </details>

        </div>
      </header>

      {/* Navigation row (desktop) */}
      <nav aria-label="Primary" className="hidden md:block border-b border-[#d4af37]">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-8 py-3 text-sm tracking-wide">
          {navLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-x-5">
              {i > 0 && <span className="text-[#d4af37]">|</span>}
              <a href={link.href} className={linkClass}>
                <Label link={link} />
              </a>
            </span>
          ))}
        </div>
      </nav>

    </div>
  );
}

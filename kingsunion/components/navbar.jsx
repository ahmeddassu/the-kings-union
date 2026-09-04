"use client";

import { useEffect, useState } from "react";

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconSize = scrolled
    ? "w-5 h-5"
    : "w-6 h-6 sm:w-7 sm:h-7";

  const logoTextSize = scrolled
    ? "text-lg"
    : "text-2xl sm:text-4xl md:text-5xl";

  const rowPad = scrolled
    ? "py-1.5"
    : "py-2.5 sm:py-4 md:py-5";

  const sideLinkSize = scrolled
    ? "text-[11px]"
    : "text-xs sm:text-sm";

  return (
    <div className="sticky top-0 z-50 bg-[#3d0202] font-serif">

      {/* Top row */}
      <header className="border-t border-b border-[#d4af37]">
        <div
          className={`flex items-center justify-center sm:justify-between gap-3 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-8 transition-all duration-300 ease-out ${rowPad}`}
        >

          {/* Social icons */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-4 flex-none min-w-0">

            <a
              href="https://www.youtube.com/@TheKingsUnionSociety"
              aria-label="YouTube"
              className="flex items-center"
            >
              <YouTubeIcon
                className={`${iconSize} transition-all duration-300`}
              />
            </a>

            <a
              href="https://www.instagram.com/thekingsunion"
              aria-label="Instagram"
              className="flex items-center"
            >
              <InstagramIcon
                className={`${iconSize} transition-all duration-300`}
              />
            </a>

            <a
              href="https://www.tiktok.com/@the.kings.union"
              aria-label="TikTok"
              className="flex items-center"
            >
              <TikTokIcon
                className={`${iconSize} transition-all duration-300`}
              />
            </a>

          </div>

          {/* Wordmark */}
          <div className="flex-1 flex justify-center min-w-0">
            <span
              className={`${logoTextSize} font-bold tracking-tight whitespace-nowrap text-white transition-all duration-300`}
            >
              the Kings Union
            </span>
          </div>

          {/* Join / Contact */}
          <div className="hidden sm:flex items-center flex-none min-w-0">
            <div
              className={`flex items-center gap-1.5 sm:gap-3 whitespace-nowrap ${sideLinkSize} transition-all duration-300`}
            >
              <a
                href="contact"
                className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
              >
                Join Us
              </a>

              <span className="text-[#d4af37]">|</span>

              <a
                href="contact"
                className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation */}
      <nav
        aria-label="Primary"
        className="border-b border-[#d4af37]"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wide">

          <a
            href="/"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Home
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="about"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            About
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="governance"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Governance
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="debates"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Debates
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="term-card"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Term Card
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="social-events"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Social Events
          </a>

          <span className="text-[#d4af37]">|</span>

          <a
            href="support"
            className="text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200"
          >
            Support Us
          </a>

        </div>
      </nav>

    </div>
  );
}
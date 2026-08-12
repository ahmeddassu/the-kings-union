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
        stroke="#111"
        strokeWidth="1.6"
      />
      <path d="M10 8.5 L16 12 L10 15.5 Z" fill="#111" />
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
        stroke="#111"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="#111"
        strokeWidth="1.6"
      />
      <circle cx="17.3" cy="6.7" r="1.1" fill="#111" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        d="M4 4 L20 20 M20 4 L4 20"
        stroke="#111"
        strokeWidth="1.8"
        strokeLinecap="round"
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
    <div className="sticky top-0 z-50 bg-white font-serif">

      {/* Top row */}
      <header className="border-t border-b border-black">
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
              <XIcon
                className={`${iconSize} transition-all duration-300`}
              />
            </a>

          </div>

          {/* Wordmark */}
          <div className="flex-1 flex justify-center min-w-0">
            <span
              className={`${logoTextSize} font-bold tracking-tight whitespace-nowrap text-black transition-all duration-300`}
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
                className="text-black hover:underline whitespace-nowrap"
              >
                Join Us
              </a>

              <span className="text-gray-400">|</span>

              <a
                href="contact"
                className="text-black hover:underline whitespace-nowrap"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation */}
      <nav aria-label="Primary" className="border-b border-black">
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wide">

          <a href="/" className="text-black hover:underline whitespace-nowrap">
            Home
          </a>

          <span className="text-gray-400">|</span>
          <a href="about" className="text-black hover:underline whitespace-nowrap">
            About
          </a>

          <span className="text-gray-400">|</span>

          <a href="governance" className="text-black hover:underline whitespace-nowrap">
            Governance
          </a>

          <span className="text-gray-400">|</span>

          <a href="debates" className="text-black hover:underline whitespace-nowrap">
            Debates
          </a>

          <span className="text-gray-400">|</span>

          <a href="term-card" className="text-black hover:underline whitespace-nowrap">
            Term Card
          </a>

          <span className="text-gray-400">|</span>

          <a href="social-events" className="text-black hover:underline whitespace-nowrap">
            Social Events
          </a>

          <span className="text-gray-400">|</span>

          <a href="support" className="text-black hover:underline whitespace-nowrap">
            Support Us
          </a>

        </div>
      </nav>

    </div>
  );
}
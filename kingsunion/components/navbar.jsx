"use client";

import { useEffect, useState } from "react";
import { navLinks, socialLinks, MEMBERSHIP_URL } from "@/lib/nav";

// Brand shapes from Simple Icons (CC0).
function BrandIcon({ d, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="#d4af37" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function YouTubeIcon({ className }) {
  return <BrandIcon className={className} d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />;
}

function InstagramIcon({ className }) {
  return <BrandIcon className={className} d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />;
}

function TikTokIcon({ className }) {
  return <BrandIcon className={className} d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />;
}

const icons = { YouTube: YouTubeIcon, Instagram: InstagramIcon, TikTok: TikTokIcon };

function Label({ link }) {
  return link.italic ? <em>{link.label}</em> : link.label;
}

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  );
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

  // The header shrinks once you've scrolled down a little and grows back near
  // the top. The two points are far apart on purpose: shrinking the header
  // moves the page by about 65px, and with a single switch point that moved
  // the page back across it, so the header flickered between sizes.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled((was) => (was ? y > 12 : y > 140));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const iconSize = scrolled ? "w-[18px] h-[18px]" : "w-5 h-5 md:w-6 md:h-6";
  const logoTextSize = scrolled ? "text-xl md:text-lg" : "text-[1.7rem] md:text-5xl";
  const crestSize = scrolled ? "h-7 md:h-7" : "h-9 sm:h-10 md:h-16";
  const rowPad = scrolled ? "py-2 md:py-1.5" : "py-3 md:py-5";
  const sideLinkSize = scrolled ? "text-[11px]" : "text-sm";
  const linkClass =
    "text-white hover:text-[#d4af37] whitespace-nowrap transition-colors duration-200";

  return (
    <>
    {/* For keyboard and screen-reader users: jump past the menus. */}
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-[#d4af37] focus:px-4 focus:py-3 focus:font-serif focus:font-bold focus:text-[#3d0202]"
    >
      Skip to content
    </a>
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
              aria-label="the King’s Union, home"
              className={`title inline-flex items-center gap-2 sm:gap-2.5 md:gap-3.5 ${logoTextSize} font-bold tracking-tight whitespace-nowrap text-white hover:text-[#d4af37] transition-all duration-300`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/crest-gold.png"
                alt=""
                width={239}
                height={280}
                className={`${crestSize} w-auto shrink-0 transition-all duration-300`}
              />
              <span>
                <span className="italic">the</span>{" "}King’s Union
              </span>
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
            {/* Search: a box on wide screens, a link on narrower ones */}
            <span className="text-[#d4af37] lg:hidden" aria-hidden="true">|</span>
            <a href="/search" className={`${linkClass} lg:hidden`}>
              Search
            </a>
            <form action="/search" method="get" role="search" className="hidden lg:flex items-center ml-2">
              <label htmlFor="header-search" className="sr-only">Search the King’s Union</label>
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Search"
                className={`${scrolled ? "h-7 w-36 text-xs" : "h-9 w-44 xl:w-52 text-sm"} border border-[#d4af37]/70 border-r-0 bg-transparent px-3 text-white placeholder:text-white/55 outline-none focus:border-white transition-all duration-300`}
              />
              <button
                type="submit"
                aria-label="Search"
                className={`${scrolled ? "h-7 w-7" : "h-9 w-9"} inline-flex items-center justify-center bg-[#d4af37] text-[#3d0202] hover:bg-white transition-all duration-300`}
              >
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Search (phone) */}
          <a href="/search" aria-label="Search" className="md:hidden flex-none p-2 text-[#d4af37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37] rounded-md">
            <SearchIcon className="w-6 h-6" />
          </a>

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

                <form action="/search" method="get" role="search" className="mt-3 flex gap-2">
                  <label htmlFor="menu-search" className="sr-only">Search the site</label>
                  <input
                    id="menu-search"
                    name="q"
                    type="search"
                    placeholder="Search"
                    className="flex-1 min-w-0 min-h-12 border border-[#d4af37] bg-transparent px-4 text-base text-white placeholder:text-white/50 outline-none focus:border-white"
                  />
                  <button type="submit" className="min-h-12 bg-[#d4af37] px-5 font-bold text-[#3d0202]">Go</button>
                </form>

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
              {i > 0 && <span aria-hidden="true" className="text-[#d4af37]">|</span>}
              <a href={link.href} className={linkClass}>
                <Label link={link} />
              </a>
            </span>
          ))}
        </div>
      </nav>

    </div>
    <div id="content" tabIndex={-1} className="scroll-mt-40 outline-none" />
    </>
  );
}

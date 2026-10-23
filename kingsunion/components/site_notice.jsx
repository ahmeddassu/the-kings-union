"use client";

// A slim notice across the top of every page while the new website is being
// finished. People can close it, and it stays closed for them (remembered in
// their browser). When the website is finished, delete <SiteNotice /> from
// app/(site)/layout.js and this file.
const MESSAGE = "Our new website isn’t finished yet. Our team is updating it, and it will be complete in the coming weeks.";
const KEY = "ku-notice-closed";

// Runs before the page is drawn, so people who closed it never see it flash.
const hideIfClosed = `try{if(localStorage.getItem("${KEY}"))document.documentElement.classList.add("notice-closed")}catch(e){}`;

function close() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // private browsing: it just closes for this visit
  }
  document.documentElement.classList.add("notice-closed");
}

export default function SiteNotice() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: hideIfClosed }} />
      <div role="region" aria-label="Website notice" className="site-notice bg-[#f6efe2] text-[#3d0202] font-serif border-b border-[#d4af37]">
        <div className="flex items-center gap-3 px-4 sm:px-6 md:px-8 py-2">
          <p className="flex-1 text-sm sm:text-base leading-snug">
            <span aria-hidden="true" className="mr-2 text-[#8a6d12]">✦</span>
            {MESSAGE}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close this notice"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-xl leading-none text-[#3d0202]/70 hover:text-[#3d0202] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3d0202]"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}

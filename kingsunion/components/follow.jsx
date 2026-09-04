const socials = [
  {
    name: "YouTube",
    handle: "@TheKingsUnionSociety",
    href: "https://www.youtube.com/@TheKingsUnionSociety",
  },
  {
    name: "Instagram",
    handle: "@thekingsunion",
    href: "https://www.instagram.com/thekingsunion",
  },
  {
    name: "TikTok",
    handle: "@the.kings.union",
    href: "https://www.tiktok.com/@the.kings.union",
  },
];

export default function FollowUs() {
  return (
    <section
      className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]"
      id="follow"
    >
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Follow us
            </h2>

            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-md">
              Keep up with upcoming debates, events, competitions and life at
              the Union.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[420px]">
            <div className="border-t border-[#d4af37]">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="group flex items-center justify-between border-b border-[#d4af37] py-4 text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
                >
                  <span className="text-base sm:text-lg font-bold">
                    {social.name}
                  </span>

                  <span className="text-xs sm:text-sm text-white/70 group-hover:text-[#3d0202]">
                    {social.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
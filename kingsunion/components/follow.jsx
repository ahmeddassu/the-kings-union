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
    <section className="bg-white text-black font-serif border-t border-black" id="follow">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Follow us
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-md">
              Keep up with upcoming debates, events, competitions and life at
              the Union.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[420px]">
            <div className="border-t border-black">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="group flex items-center justify-between border-b border-black py-4 hover:bg-black hover:text-white transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold">
                    {social.name}
                  </span>

                  <span className="text-xs sm:text-sm text-gray-600 group-hover:text-white">
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
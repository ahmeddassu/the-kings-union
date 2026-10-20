// Header and frame for the admin pages.
const sections = [
  ["", "Debates"],
  ["/motions", "Motions"],
  ["/messages", "Messages"],
  ["/alerts", "Ticket alerts"],
  ["/applications", "Speaker applications"],
  ["/posters", "Poster QR codes"],
];

export default function AdminShell({ base, children, wide = false, current = "" }) {
  return (
    <>
      <header className="border-b border-[#d4af37]/60">
        <div className="px-4 sm:px-6 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <a href={base || "/"} className="inline-flex items-center gap-3 min-h-11">
            <img src="/crest-gold.png" alt="" className="h-9 w-auto" />
            <span className="title text-lg sm:text-xl font-bold">
              <em>the</em> King’s Union <span className="font-normal text-[#d4af37]">· Admin</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href={`${base}/debates/new`}
              className="inline-flex min-h-11 items-center bg-[#d4af37] px-4 text-sm font-bold text-[#3d0202] hover:bg-white"
            >
              + New debate
            </a>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="min-h-11 px-3 text-sm text-white/70 hover:text-white underline underline-offset-4">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin sections" className="px-4 sm:px-6 md:px-8 flex gap-1 overflow-x-auto">
          {sections.map(([path, name]) => (
            <a
              key={name}
              href={`${base}${path}` || "/"}
              aria-current={current === path ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm ${
                current === path ? "border-[#d4af37] text-white font-bold" : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              {name}
            </a>
          ))}
        </nav>
      </header>
      <main className={`flex-1 w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12 ${wide ? "" : "max-w-6xl mx-auto"}`}>{children}</main>
    </>
  );
}

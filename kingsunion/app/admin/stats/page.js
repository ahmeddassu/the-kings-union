import AdminShell from "@/components/voting/admin_shell";
import DailyChart from "@/components/voting/stats_chart";
import { requireAdmin } from "@/lib/admin_page";
import { getStats } from "@/lib/visitor_stats";
import { getEvents } from "@/lib/sheet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visitor stats · Admin" };

const NAMES = {
  "/": "Homepage", "/about": "About", "/debates": "Debates", "/votes": "How King’s Votes", "/term-card": "Term Card",
  "/membership": "Membership", "/kingsway": "Kingsway", "/support": "Support Us", "/contact": "Contact", "/press": "Press",
  "/governance": "Governance", "/speak": "Speak at the Union", "/speak/apply": "Apply to speak", "/motions": "Suggest a motion",
  "/get-involved": "Get involved", "/welcome": "Welcome", "/contact/sent": "Form sent",
};

function Tile({ label, value, note }) {
  return (
    <div className="border-t border-[#d4af37] pt-4">
      <p className="text-sm text-white/70">{label}</p>
      <p className="title mt-1 text-4xl sm:text-5xl font-bold">{value.toLocaleString("en-GB")}</p>
      {note && <p className="mt-1 text-sm text-white/55">{note}</p>}
    </div>
  );
}

function BarList({ title, rows, total, empty, render }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <section className="min-w-0">
      <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-white/60">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="relative">
              <div aria-hidden="true" className="absolute inset-y-0 left-0 rounded bg-[#b38d22]/25" style={{ width: `${(r.count / max) * 100}%` }} />
              <div className="relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
                <span className="min-w-0 truncate">{render ? render(r.key) : r.key}</span>
                <span className="shrink-0 tabular-nums text-white/80">
                  {r.count.toLocaleString("en-GB")}
                  {total ? <span className="text-white/45"> · {Math.round((r.count / total) * 100)}%</span> : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function StatsPage() {
  const base = await requireAdmin();
  const [s, events] = await Promise.all([getStats(30), getEvents().catch(() => [])]);
  const eventNames = Object.fromEntries(events.map((e) => [`/events/${e.slug}`, e.title]));
  const pageName = (p) => NAMES[p] || eventNames[p] || p;
  const countryName = (() => {
    try {
      const dn = new Intl.DisplayNames(["en-GB"], { type: "region" });
      return (c) => dn.of(c) || c;
    } catch {
      return (c) => c;
    }
  })();
  const deviceTotal = s.devices.mobile + s.devices.desktop;
  const mobilePct = deviceTotal ? Math.round((s.devices.mobile / deviceTotal) * 100) : 0;

  return (
    <AdminShell base={base} current="/stats">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Last 30 days</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Visitor stats</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        How many people visit kingsunion.org.uk and what they look at. Counted without cookies or personal data,
        so no cookie banner is needed. Admin and voting pages aren’t counted.
      </p>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
        <Tile label="Visitors today" value={s.today.visitors} note={`${s.today.views} page views`} />
        <Tile label="Visitors, last 7 days" value={s.visitors7} />
        <Tile label="Visitors, last 30 days" value={s.visitors} />
        <Tile label="Page views, last 30 days" value={s.views} />
      </div>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Visitors per day</h2>
        <div className="mt-4">
          <DailyChart daily={s.daily} />
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <BarList title="Most viewed pages" rows={s.pages} total={s.views} empty="No visits yet." render={pageName} />
        <div className="space-y-10 min-w-0">
          <BarList title="Where visitors come from" rows={s.referrers} empty="No visits from other websites yet (direct visits and typed links aren’t listed)." />
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#d4af37]">Phone or computer</h2>
            {deviceTotal ? (
              <>
                <div className="mt-3 flex h-5 gap-[2px]" aria-hidden="true">
                  {s.devices.mobile > 0 && <div className="rounded-l" style={{ flex: s.devices.mobile, background: "#b38d22" }} />}
                  {s.devices.desktop > 0 && <div className="rounded-r" style={{ flex: s.devices.desktop, background: "#4a8ad2" }} />}
                </div>
                <p className="mt-2 flex justify-between text-sm">
                  <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "#b38d22" }} />Phones and tablets {mobilePct}%</span>
                  <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "#4a8ad2" }} />Computers {100 - mobilePct}%</span>
                </p>
              </>
            ) : (
              <p className="mt-3 text-white/60">No visits yet.</p>
            )}
          </section>
          <BarList title="Countries" rows={s.countries} total={s.countries.reduce((a, c) => a + c.count, 0)} empty="Shown once the site is live on Vercel." render={countryName} />
        </div>
      </div>
    </AdminShell>
  );
}

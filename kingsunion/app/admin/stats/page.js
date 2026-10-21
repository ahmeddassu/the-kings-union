import AdminShell from "@/components/voting/admin_shell";
import DailyChart from "@/components/voting/stats_chart";
import LiveVisitors from "@/components/voting/live_visitors";
import { requireAdmin } from "@/lib/admin_page";
import { getStats, MIN_CITY_COUNT } from "@/lib/visitor_stats";
import { getEvents } from "@/lib/sheet";
import { PAGE_NAMES } from "@/lib/page_names";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visitor stats · Admin" };

const RANGES = [7, 30, 90];

const UK_NATIONS = { ENG: "England", SCT: "Scotland", WLS: "Wales", NIR: "Northern Ireland" };
const DEVICE_NAMES = { phone: "Phones", tablet: "Tablets", desktop: "Computers" };
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmt = (n) => Math.round(n).toLocaleString("en-GB");
const pct = (x) => `${Math.round(x * 100)}%`;
const duration = (s) => (s == null ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);
const eyebrow = "text-xs uppercase tracking-widest text-[#d4af37]";

function Change({ now, before, days, lowerIsBetter = false }) {
  if (now == null || before == null) return null;
  if (!before) return <p className="mt-1 text-sm text-white/50">No data for the {days} days before</p>;
  const diff = (now - before) / before;
  if (Math.abs(diff) < 0.005) return <p className="mt-1 text-sm text-white/55">Same as the {days} days before</p>;
  const up = diff > 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <p className={`mt-1 text-sm ${good ? "text-[#7fd1a8]" : "text-[#f3c4c4]"}`}>
      {up ? "▲" : "▼"} {Math.abs(Math.round(diff * 100))}% {up ? "up" : "down"} on the {days} days before
    </p>
  );
}

function Tile({ label, value, children, hint }) {
  return (
    <div className="border-t border-[#d4af37] pt-4 min-w-0">
      <p className="text-sm text-white/70">{label}</p>
      <p className="title mt-1 text-3xl sm:text-4xl font-bold tabular-nums">{value}</p>
      {children}
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  );
}

function BarList({ title, rows, empty, render, total, note }) {
  const sum = total ?? rows.reduce((a, r) => a + r.count, 0);
  const max = Math.max(...rows.map((r) => r.count), 1);
  const shown = rows.filter((r) => r.count > 0);
  return (
    <section className="min-w-0">
      <h2 className={eyebrow}>{title}</h2>
      {note && <p className="mt-1 text-sm text-white/50">{note}</p>}
      {shown.length === 0 ? (
        <p className="mt-3 text-white/60">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li key={r.key} className="relative">
              <div aria-hidden="true" className="absolute inset-y-0 left-0 rounded bg-[#b38d22]/25" style={{ width: `${(r.count / max) * 100}%` }} />
              <div className="relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
                <span className="min-w-0 truncate" title={render ? render(r.key) : r.key}>{render ? render(r.key) : r.key}</span>
                <span className="shrink-0 tabular-nums text-white/80">
                  {fmt(r.count)}
                  {sum ? <span className="text-white/45"> · {Math.round((r.count / sum) * 100)}%</span> : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Busiest times: one gold cell per weekday and hour, brighter means busier.
function Heatmap({ heat }) {
  const max = Math.max(...heat.flat(), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] table-fixed border-separate border-spacing-[2px] text-xs">
        <caption className="sr-only">Page views by day of the week and hour (London time)</caption>
        <thead>
          <tr>
            <th scope="col" className="w-10" aria-label="Day" />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} scope="col" className="overflow-visible whitespace-nowrap text-left font-normal text-white/45 tabular-nums">
                {h % 3 === 0 ? String(h).padStart(2, "0") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heat.map((row, d) => (
            <tr key={d}>
              <th scope="row" className="pr-2 text-left font-normal text-white/60">{WEEKDAYS[d]}</th>
              {row.map((n, h) => (
                <td
                  key={h}
                  title={`${WEEKDAYS[d]} ${String(h).padStart(2, "0")}:00 – ${n} page views`}
                  aria-label={`${WEEKDAYS[d]} ${h}:00, ${n} page views`}
                  className="h-6 rounded-sm"
                  style={{ background: n ? `rgba(212,175,55,${0.12 + 0.88 * (n / max)})` : "rgba(255,255,255,0.05)" }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 flex items-center gap-2 text-xs text-white/50" aria-hidden="true">
        Quiet
        <span className="inline-block h-3 w-24 rounded-sm" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,1))" }} />
        Busy
      </p>
    </div>
  );
}

function PagesTable({ pages, name }) {
  if (!pages.length) return <p className="mt-3 text-white/60">No visits yet.</p>;
  const th = "px-2 py-2 text-left font-normal text-white/55 whitespace-nowrap";
  const td = "px-2 py-2 tabular-nums whitespace-nowrap text-white/85";
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-white/15">
          <tr>
            <th scope="col" className={th}>Page</th>
            <th scope="col" className={`${th} text-right`}>Views</th>
            <th scope="col" className={`${th} text-right`}>Avg. time on page</th>
            <th scope="col" className={`${th} text-right`}>Read to the end</th>
            <th scope="col" className={`${th} text-right`}>First page of a visit</th>
            <th scope="col" className={`${th} text-right`}>Ticket clicks</th>
            <th scope="col" className={`${th} text-right`}>Added to calendar</th>
          </tr>
        </thead>
        <tbody>
          {pages.slice(0, 25).map((p) => (
            <tr key={p.path} className="border-b border-white/5">
              <td className="px-2 py-2 max-w-[260px] truncate" title={p.path}>
                <a href={`https://www.kingsunion.org.uk${p.path}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37]">{name(p.path)}</a>
              </td>
              <td className={`${td} text-right`}>{fmt(p.views)}</td>
              <td className={`${td} text-right`}>{duration(p.avgSecs)}</td>
              <td className={`${td} text-right`}>{p.readPct == null ? "–" : `${p.readPct}%`}</td>
              <td className={`${td} text-right`}>{p.entries ? fmt(p.entries) : "–"}</td>
              <td className={`${td} text-right`}>{p.tickets ? fmt(p.tickets) : "–"}</td>
              <td className={`${td} text-right`}>{p.calendar ? fmt(p.calendar) : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HourBars({ hours }) {
  const max = Math.max(...hours, 1);
  return (
    <div>
      <div className="flex h-28 items-end gap-[2px]">
        {hours.map((n, h) => (
          <div key={h} className="flex h-full flex-1 items-end" title={`${String(h).padStart(2, "0")}:00 – ${n} page views`}>
            <span className="block w-full rounded-t" style={{ height: `${(n / max) * 100}%`, minHeight: n ? 2 : 0, background: "#b38d22" }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex text-[10px] sm:text-xs text-white/45 tabular-nums" aria-hidden="true">
        {hours.map((_, h) => (
          <span key={h} className="flex-1 text-center">{h % 6 === 0 ? String(h).padStart(2, "0") : ""}</span>
        ))}
      </div>
    </div>
  );
}

export default async function StatsPage({ searchParams }) {
  const base = await requireAdmin("stats");
  const q = await searchParams;
  const days = RANGES.includes(Number(q?.days)) ? Number(q.days) : 30;
  const [s, events] = await Promise.all([getStats(days), getEvents().catch(() => [])]);
  const eventNames = Object.fromEntries(events.map((e) => [`/events/${e.slug}`, e.title]));
  const pageName = (p) => PAGE_NAMES[p] || eventNames[p] || p;
  const dn = (type) => {
    try {
      const d = new Intl.DisplayNames(["en-GB"], { type });
      return (c) => d.of(c) || c;
    } catch {
      return (c) => c;
    }
  };
  const countryName = dn("region");
  const languageName = dn("language");
  const deviceRows = (m) => ["phone", "tablet", "desktop"].map((key) => ({ key, count: m[key] || 0 }));
  const visitDevices = Object.keys(s.visitDevices).length ? s.visitDevices : s.devices;
  const eventPages = s.pages.filter((p) => p.path.startsWith("/events/"));
  const P = s.previous;

  return (
    <AdminShell base={base} current="/stats">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>Last {days} days</p>
          <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Visitor stats</h1>
        </div>
        <nav aria-label="Time period" className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <a
              key={r}
              href={`${base}/stats?days=${r}`}
              aria-current={r === days ? "page" : undefined}
              className={`inline-flex min-h-11 items-center whitespace-nowrap px-3 sm:px-4 text-sm font-bold border ${r === days ? "border-[#d4af37] bg-[#d4af37] text-[#3d0202]" : "border-[#d4af37]/60 text-white hover:bg-white/10"}`}
            >
              {r} days
            </a>
          ))}
          <a href={`/api/admin/stats/export?days=${days}`} className="inline-flex min-h-11 items-center whitespace-nowrap px-3 sm:px-4 text-sm font-bold border border-white/30 text-white hover:bg-white/10">
            Download CSV
          </a>
        </nav>
      </div>
      <p className="mt-3 max-w-3xl text-white/70">
        Counted on our own database without cookies. Only totals are kept, never what one person did, so this stays
        within UK GDPR without a cookie banner (explained to visitors on the <a href="https://www.kingsunion.org.uk/privacy" className="underline underline-offset-4 hover:text-[#d4af37]">Privacy</a> page, where they can opt out).
        Admin and voting pages aren’t counted, and nor are search-engine bots.
      </p>

      <LiveVisitors pageNames={{ ...PAGE_NAMES, ...eventNames }} />

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-8">
        <Tile label="Visitors" value={fmt(s.visitors)} hint="Different people (counted once a day)">
          <Change now={s.visitors} before={P.visitors} days={days} />
        </Tile>
        <Tile label="Visits" value={fmt(s.visits)} hint="A visit ends when they leave">
          <Change now={s.visits} before={P.visits} days={days} />
        </Tile>
        <Tile label="Page views" value={fmt(s.views)}>
          <Change now={s.views} before={P.views} days={days} />
        </Tile>
        <Tile label="Pages per visit" value={s.pagesPerVisit == null ? "–" : s.pagesPerVisit.toFixed(1)}>
          <Change now={s.pagesPerVisit} before={P.pagesPerVisit} days={days} />
        </Tile>
        <Tile label="Average visit" value={duration(s.avgVisitSecs)} hint="Time the site was actually on screen">
          <Change now={s.avgVisitSecs} before={P.avgVisitSecs} days={days} />
        </Tile>
        <Tile label="Left after one page" value={s.bounceRate == null ? "–" : pct(s.bounceRate)} hint="Lower is better">
          <Change now={s.bounceRate} before={P.bounceRate} days={days} lowerIsBetter />
        </Tile>
      </div>

      <section className="mt-12">
        <h2 className={eyebrow}>Visitors per day</h2>
        <div className="mt-4">
          <DailyChart daily={s.daily} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className={eyebrow}>All pages</h2>
        <p className="mt-1 text-sm text-white/50">“Read to the end” means they scrolled at least 90% of the way down.</p>
        <PagesTable pages={s.pages} name={pageName} />
      </section>

      {eventPages.length > 0 && (
        <section className="mt-12">
          <h2 className={eyebrow}>Debates and events</h2>
          <p className="mt-1 text-sm text-white/50">How each event page is doing: views, and how many went on to tickets or their calendar.</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {eventPages.slice(0, 9).map((p) => (
              <div key={p.path} className="border border-white/15 p-4">
                <p className="font-bold leading-snug">{pageName(p.path)}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="text-white/50">Views</dt><dd className="title text-2xl font-bold tabular-nums">{fmt(p.views)}</dd></div>
                  <div><dt className="text-white/50">Tickets</dt><dd className="title text-2xl font-bold tabular-nums">{fmt(p.tickets)}</dd></div>
                  <div><dt className="text-white/50">Calendar</dt><dd className="title text-2xl font-bold tabular-nums">{fmt(p.calendar)}</dd></div>
                </dl>
                {p.views > 0 && (
                  <p className="mt-2 text-sm text-white/60">
                    {Math.round(((p.tickets + p.calendar) / p.views) * 100)}% of views led to tickets or a calendar · avg. {duration(p.avgSecs)} on page
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <BarList title="How people find us" rows={s.channels} empty="No visits yet." />
        <BarList title="Websites that sent visitors" rows={s.referrers} empty="No visits from other websites yet." />
        <BarList
          title="Posters and campaign links"
          rows={s.campaigns}
          empty="None yet. Poster QR codes from admin now count here, and so does any link ending ?utm_source=instagram."
          note="Source / medium / campaign"
        />
        <BarList title="First page people land on" rows={s.entries} empty="No visits yet." render={pageName} />
        <BarList title="Clicks" rows={s.events} empty="No clicks on tickets, calendars or outside links yet." note="Tickets, calendar buttons, forms and links to other sites" />
        <BarList title="Broken links people tried (page not found)" rows={s.notFound} empty="None. Every link people used worked." />
      </div>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="min-w-0">
          <h2 className={eyebrow}>Busiest times of day</h2>
          <p className="mt-1 text-sm text-white/50">Page views by hour, London time. Useful for when to post.</p>
          <div className="mt-4"><HourBars hours={s.hours} /></div>
        </div>
        <div className="min-w-0">
          <h2 className={eyebrow}>By day and hour</h2>
          <div className="mt-4"><Heatmap heat={s.heat} /></div>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <BarList title="How long visits last" rows={s.durations} empty="No finished visits yet." />
        <BarList title="Pages looked at per visit" rows={s.depths} empty="No finished visits yet." />
        <BarList title="Devices" rows={deviceRows(visitDevices)} empty="No visits yet." render={(k) => DEVICE_NAMES[k]} />
        <BarList title="Screen sizes" rows={s.sizes} empty="No visits yet." />
        <BarList title="Browsers and apps" rows={s.browsers} empty="No visits yet." note="“Instagram app” means they opened the link inside Instagram." />
        <BarList title="Operating systems" rows={s.systems} empty="No visits yet." />
        <BarList title="Countries" rows={s.countries} empty="Shown once the site is live on Vercel." render={countryName} />
        <BarList title="UK nations" rows={s.regions} empty="Shown once the site is live on Vercel." render={(c) => UK_NATIONS[c] || c} />
        <BarList
          title="Cities"
          rows={s.cities}
          empty="Shown once the site is live on Vercel."
          note={`Places with fewer than ${MIN_CITY_COUNT} visits are hidden for privacy.`}
        />
        <BarList title="Browser languages" rows={s.languages} empty="No visits yet." render={languageName} />
      </div>
    </AdminShell>
  );
}

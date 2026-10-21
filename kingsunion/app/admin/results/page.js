import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { listDebates, getCounts } from "@/lib/voting";
import { verdictOf } from "@/lib/result_card";
import { longDate } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = { title: "Result cards · Admin" };

const btn = "inline-flex min-h-11 items-center justify-center px-4 text-sm font-bold transition-colors";

// Every debate with votes, with its result ready to post on Instagram.
export default async function ResultsPage() {
  const base = await requireAdmin(["results", "debates"]);
  const debates = await listDebates();
  const withCounts = (await Promise.all(debates.map(async (d) => ({ d, c: await getCounts(d.id) })))).filter(({ c }) => c.total > 0);

  return (
    <AdminShell base={base} current="/results">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">For Instagram</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Result cards</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Every debate’s result as a ready-made image in the Union’s colours: a Story (tall) or a feed post. Download it
        and post it straight from your phone.
      </p>
      {withCounts.length === 0 ? (
        <p className="mt-10 border border-dashed border-[#d4af37]/60 px-6 py-12 text-center text-white/70">
          Result cards appear here once a debate has votes.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {withCounts.map(({ d, c }) => {
            const card = (f) => `/api/admin/debates/${d.id}/card?format=${f}`;
            return (
              <li key={d.id} className="flex flex-col">
                <a href={card("story")} target="_blank" rel="noopener" className="block border border-[#d4af37]/40 hover:border-[#d4af37]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card("story")} alt={`Result card: “${d.title}”, ${c.aye} Aye to ${c.no} No`} loading="lazy" width={1080} height={1920} className="h-auto w-full" />
                </a>
                <p className="mt-3 font-bold leading-snug">“{d.title}”</p>
                <p className="text-sm text-white/60">
                  {[d.date ? longDate(d.date) : "", `${c.aye}–${c.no}`, d.status === "closed" ? verdictOf(c) : "voting still open"].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`${card("story")}&download=1`} className={`${btn} bg-[#d4af37] text-[#3d0202] hover:bg-white`}>Download Story</a>
                  <a href={`${card("post")}&download=1`} className={`${btn} border border-[#d4af37]/70 hover:bg-white/10`}>Download post</a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}

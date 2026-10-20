// Numbers for the "How King's Votes" page, worked out from the debate archive.
import { getPastDebates, hasCounts, verdict, TOPICS } from "@/lib/debates";

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

export async function getVoteStats() {
  const all = await getPastDebates();
  const counted = all
    .filter(hasCounts)
    .map((d) => {
      const total = d.proposition + d.opposition;
      // Whole percentages, or one decimal place when rounding would make a
      // non-tied vote look like 50–50.
      let ayePct = pct(d.proposition, total);
      let noPct = total ? 100 - ayePct : 0;
      if (ayePct === noPct && d.proposition !== d.opposition) {
        ayePct = Math.round((d.proposition / total) * 1000) / 10;
        noPct = Math.round((100 - ayePct) * 10) / 10;
      }
      return {
        ...d,
        total,
        ayePct,
        noPct,
        margin: Math.abs(d.proposition - d.opposition),
        marginPct: total ? Math.abs(d.proposition - d.opposition) / total : 0,
        carried: d.proposition > d.opposition,
      };
    });
  // Debates with a plain carried/defeated result (counted or not).
  const decided = all.filter((d) => hasCounts(d) || d.outcome === "carried" || d.outcome === "defeated");
  const carried = decided.filter((d) => verdict(d) === "Carried").length;

  const votes = counted.reduce((s, d) => s + d.total, 0);
  const byDate = [...counted].sort((a, b) => a.date.localeCompare(b.date));
  const closest = [...counted].sort((a, b) => a.margin - b.margin || b.total - a.total)[0] || null;
  const decisive = [...counted].sort((a, b) => b.marginPct - a.marginPct)[0] || null;
  const biggest = [...counted].sort((a, b) => b.total - a.total)[0] || null;

  const topics = TOPICS.map((t) => {
    const ds = decided.filter((d) => d.topics.includes(t.id));
    const c = ds.filter((d) => verdict(d) === "Carried").length;
    return { id: t.id, label: t.label, carried: c, defeated: ds.length - c, total: ds.length };
  })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    debates: all.length,
    countedDebates: counted.length,
    votes,
    average: counted.length ? Math.round(votes / counted.length) : 0,
    decided: decided.length,
    carried,
    defeated: decided.length - carried,
    closest,
    decisive,
    biggest,
    divisions: [...counted].sort((a, b) => b.date.localeCompare(a.date)),
    turnout: byDate.map((d) => ({ title: d.title, date: d.date, total: d.total, href: d.href || null })),
    topics,
  };
}

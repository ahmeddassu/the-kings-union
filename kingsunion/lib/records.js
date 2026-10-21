// The Union's record book (/records), worked out from the debate archive, the
// speakers on the term card, and door counts from admin → Attendance.
// Nothing here is typed in by hand: records update themselves as results come in.
import { getPastDebates, hasCounts, verdict } from "@/lib/debates";
import { getVoteStats } from "@/lib/vote_stats";
import { getSpeakerDirectory } from "@/lib/speaker_profiles";
import { getAttendanceTotals } from "@/lib/attendance";

// "Autumn 2025" (September to December), "Spring 2026" (January to April) or
// "Summer 2026" (May to August).
export function termOf(iso) {
  const [y, m] = iso.split("-").map(Number);
  if (m >= 9) return { key: `${y}-3`, label: `Autumn ${y}` };
  if (m >= 5) return { key: `${y}-2`, label: `Summer ${y}` };
  return { key: `${y}-1`, label: `Spring ${y}` };
}

const top = (list, score) => [...list].sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date))[0] || null;

export async function getRecords() {
  const [stats, all, speakers, doors] = await Promise.all([
    getVoteStats(),
    getPastDebates(),
    getSpeakerDirectory().catch(() => []),
    getAttendanceTotals(),
  ]);
  const counted = stats.divisions; // debates with both counts, with totals worked out

  // Most votes for, and against, a motion.
  const mostFor = top(counted, (d) => d.proposition);
  const mostAgainst = top(counted, (d) => d.opposition);

  // Longest run of motions carried (or defeated) in a row.
  const decided = all
    .filter((d) => hasCounts(d) || d.outcome === "carried" || d.outcome === "defeated")
    .sort((a, b) => a.date.localeCompare(b.date));
  let streak = null;
  let run = [];
  for (const d of decided) {
    const v = verdict(d);
    if (run.length && verdict(run[0]) === v) run.push(d);
    else run = [d];
    if (run.length >= 2 && (!streak || run.length >= streak.debates.length))
      streak = { verdict: v, debates: [...run] };
  }

  // Terms and years, by votes cast.
  const terms = new Map();
  for (const d of counted) {
    const t = termOf(d.date);
    const row = terms.get(t.key) || { ...t, votes: 0, debates: 0 };
    row.votes += d.total;
    row.debates += 1;
    terms.set(t.key, row);
  }
  const busiestTerm = [...terms.values()].sort((a, b) => b.votes - a.votes)[0] || null;

  const years = new Map();
  for (const d of all) {
    const row = years.get(d.year) || { year: d.year, debates: 0, counted: 0, votes: 0, carried: 0, defeated: 0 };
    row.debates += 1;
    if (hasCounts(d)) {
      row.counted += 1;
      row.votes += d.proposition + d.opposition;
    }
    const v = verdict(d);
    if (v === "Carried") row.carried += 1;
    else if (v === "Defeated") row.defeated += 1;
    years.set(d.year, row);
  }

  // Speakers who have spoken more than once, and their record.
  const regulars = speakers
    .filter((p) => p.debates.length >= 2)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      student: p.student,
      appearances: p.debates.length,
      wins: p.debates.filter((d) => d.won === true).length,
      decided: p.debates.filter((d) => d.won !== null).length,
    }))
    .sort((a, b) => b.appearances - a.appearances || b.wins - a.wins)
    .slice(0, 8);

  // Biggest crowd at the door, from Luma check-ins.
  const door = doors.length ? [...doors].sort((a, b) => b.checkedIn - a.checkedIn)[0] : null;

  return {
    biggest: stats.biggest,
    closest: stats.closest,
    decisive: stats.decisive,
    mostFor,
    mostAgainst,
    streak,
    busiestTerm: terms.size > 1 ? busiestTerm : null,
    years: [...years.values()].sort((a, b) => b.year.localeCompare(a.year)),
    regulars,
    door: door ? { ...door, href: `/events/${door.slug}` } : null,
    topTopic: stats.topics[0] || null,
    first: counted.length ? counted[counted.length - 1] : null,
    totals: { debates: stats.debates, votes: stats.votes, carried: stats.carried, decided: stats.decided },
  };
}

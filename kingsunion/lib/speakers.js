import { getEvents } from "@/lib/sheet";
import { getPastDebates } from "@/lib/debates";

// King's students who have spoken. Everyone else counts as an external (guest)
// speaker. Add new student speakers here, spelled exactly as on the term card.
export const KINGS_STUDENTS = [
  "Zehna Ahmad", "Robert Young", "Arvind Iyengar", "Fernando Marco",
  "Cai Finch", "Pranav Karthikeyan", "Juan Duve", "George Phantom",
  "Eva Tomás Sastre", "Cole Brydson", "Seb Vials",
];

// Everyone who has spoken, newest debate first, each linked to their debate.
// Chatham House debates are left out. Each has `student: true/false`.
export async function getSpeakers() {
  const events = (await getEvents())
    .filter((e) => e.type === "Debate" && !e.chathamHouse)
    .sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Map();
  for (const e of events) {
    for (const name of [...(e.proposition || []), ...(e.opposition || [])]) {
      if (!seen.has(name))
        seen.set(name, { name, slug: e.slug, motion: e.title, student: KINGS_STUDENTS.includes(name) });
    }
  }
  return [...seen.values()];
}

// The academic year runs from 1 September. Returns e.g. { start: "2026-09-01", label: "2026–27" }.
export function academicYear(today = new Date()) {
  const iso = today.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const [y, m] = iso.split("-").map(Number);
  const startYear = m >= 9 ? y : y - 1;
  return { start: `${startYear}-09-01`, label: `${startYear}–${String(startYear + 1).slice(2)}` };
}

// Numbers for the current academic year only.
export async function getStats() {
  const { start, label } = academicYear();
  const debates = (await getPastDebates()).filter((d) => d.date >= start);
  const speakers = new Set();
  for (const e of await getEvents()) {
    if (e.type !== "Debate" || e.chathamHouse || e.date < start || !e.result) continue;
    for (const n of [...(e.proposition || []), ...(e.opposition || [])]) speakers.add(n);
  }
  return {
    label,
    debates: debates.length,
    speakers: speakers.size,
    votes: debates.reduce((n, d) => n + (d.proposition || 0) + (d.opposition || 0), 0),
  };
}

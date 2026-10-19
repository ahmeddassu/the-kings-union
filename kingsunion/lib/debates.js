// Past debates shown on the homepage and the Debates page.
// Debates from the current term card appear automatically once both vote counts
// are filled in (in the Google Sheet, or lib/events.js as a fallback).
// Older debates from before the sheet existed are listed by hand below
// (2025–26 results copied from the old Squarespace site).
// If the vote counts weren't recorded, leave proposition/opposition out and set
// `outcome` ("carried" or "defeated"), or `resultLabel` for anything else.

import { getEvents, slugify } from "@/lib/sheet";
import { getPublishedResults } from "@/lib/published";

const archive = [
  {
    title: "Left vs Right: KCLCA vs KCL Your Party",
    date: "2026-03-19",
    description:
      "The KCL Conservative Association won the debate on swing, increasing their support from 47% to 59% between the beginning and end of the debate.",
    resultLabel: "KCLCA won on swing",
    topic: "politics",
  },
  {
    title: "This House believes that billionaires should not exist",
    date: "2026-03-17",
    description: "",
    proposition: 38,
    opposition: 43,
  },
  {
    title: "This House believes in God",
    date: "2026-03-10",
    description: "",
    proposition: 53,
    opposition: 51,
  },
  {
    title: "This House would abolish the Monarchy",
    date: "2026-03-03",
    description: "",
    proposition: 45,
    opposition: 30,
  },
  {
    title: "This House believes that abortion should be a human right",
    date: "2026-02-18",
    description: "",
    proposition: 75,
    opposition: 20,
  },
  {
    title: "This House believes that the British Empire was a national disgrace",
    date: "2026-02-10",
    description: "",
    proposition: 61,
    opposition: 31,
  },
  {
    title: "This House prefers socialism over capitalism",
    date: "2026-02-03",
    description: "",
    outcome: "carried",
  },
  {
    title: "This House believes that the West should institute regime change in Iran",
    date: "2026-01-27",
    description: "",
    outcome: "defeated",
  },
  {
    title: "This House Supports the Ongoing American Intervention In Venezuela",
    date: "2026-01-20",
    description: "",
    proposition: 30,
    opposition: 43,
  },
  {
    title: "This House Believes that Britain Needs More Immigration",
    date: "2025-12-09",
    description: "",
    proposition: 30,
    opposition: 9,
  },
  {
    title: "This House Would Rejoin the European Union",
    date: "2025-11-26",
    description: "A tight defeat for the motion",
    proposition: 16,
    opposition: 16,
  },
];

// Topics for the archive filters. Each debate gets its topics from the Google
// Sheet's "Topic" column (comma-separated) if filled in; otherwise they're
// guessed from words in the motion below. Add words here to improve the guesses.
export const TOPICS = [
  { id: "politics", label: "Politics", words: ["government", "confidence", "parliament", "election", "vote", "scotland", "independen", "european union", "brexit", "monarch", "democra", "party", "prime minister"] },
  { id: "international", label: "International", words: ["west", "rearm", "war", "nato", "venezuela", "america", "china", "russia", "ukraine", "israel", "palestin", "gaza", "october 7", "intervention", "european union", "foreign", "defence", "military"] },
  { id: "economy", label: "Economy", words: ["tax", "wealth", "econom", "budget", "money", "capitalis", "market", "billionaire", "trade", "spending"] },
  { id: "society", label: "Society", words: ["social media", "school", "education", "immigration", "university", "student", "class", "welfare", "housing", "health", "nhs", "children", "under-sixteen", "free speech"] },
  { id: "ethics", label: "Ethics & Religion", words: ["religion", "god", "faith", "church", "death penalty", "moral", "ethic", "euthanasia", "abortion", "punish", "justice"] },
  { id: "history", label: "History", words: ["caesar", "empire", "history", "historical", "century", "revolution", "would have"] },
];

function topicsFor(title, given) {
  const fromSheet = String(given || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .map((t) => TOPICS.find((x) => x.id === t || x.label.toLowerCase() === t)?.id)
    .filter(Boolean);
  if (fromSheet.length) return fromSheet;
  const text = title.toLowerCase();
  // Words match at the start of a word: "war" matches "wars" but not "reward".
  const escape = (w) => w.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const has = (w) => new RegExp("(^|[^a-z])" + escape(w)).test(text);
  const guessed = TOPICS.filter((t) => t.words.some(has)).map((t) => t.id);
  return guessed.length ? guessed : ["society"];
}

// "2025/26" style academic year: September onwards counts as the new year.
export function academicYear(iso) {
  const [y, m] = iso.split("-").map(Number);
  const start = m >= 9 ? y : y - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

export function displayDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// True when both vote counts were recorded.
export function hasCounts(d) {
  return typeof d.proposition === "number" && typeof d.opposition === "number";
}

// "Carried" or "Defeated". A tied vote means the motion falls, so it counts as
// defeated (as the old site recorded the 16–16 European Union debate).
export function verdict(d) {
  if (d.resultLabel) return d.resultLabel;
  if (!hasCounts(d)) return d.outcome === "carried" ? "Carried" : d.outcome === "defeated" ? "Defeated" : "Result";
  return d.proposition > d.opposition ? "Carried" : "Defeated";
}

export async function getPastDebates() {
  const events = await getEvents();
  const fromTermCard = events
    .filter((e) => e.type === "Debate" && e.result)
    .map((e) => ({
      title: e.title,
      date: e.date,
      description: e.description,
      proposition: e.result.proposition,
      opposition: e.result.opposition,
      href: `/events/${e.slug}`,
      photo: e.photo,
      topic: e.topic,
      speakers: [...(e.proposition || []), ...(e.opposition || [])],
    }));

  // Live-vote results for debates that aren't on the term card.
  const known = new Set(events.map((e) => slugify(e.title)));
  const fromVoting = (await getPublishedResults())
    .filter((p) => p.date && !known.has(slugify(p.title)))
    .map((p) => ({ title: p.title, date: p.date, description: "", proposition: p.proposition, opposition: p.opposition }));

  return [...fromTermCard, ...fromVoting, ...archive]
    .map((d) => ({ ...d, topics: topicsFor(d.title, d.topic), year: academicYear(d.date) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

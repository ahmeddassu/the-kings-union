// Site search (/search): debates and events, speakers, pages, the guide, the
// FAQ, the committee and Kingsway articles. Everything is searched on the
// server from data the site already has, so there's nothing to keep updated.
import { getEvents } from "@/lib/sheet";
import { getPastDebates, displayDate } from "@/lib/debates";
import { getSpeakerDirectory } from "@/lib/speaker_profiles";
import { getKingswayPosts } from "@/lib/kingsway";
import { faq } from "@/lib/faq";
import { sections as guideSections } from "@/lib/guide";
import { profiles } from "@/lib/people";

// The main pages, with words people might search for.
const PAGES = [
  ["/", "Home", "The King’s Union, the debating society at King’s College London."],
  ["/about", "About", "Who we are and how a debate works."],
  ["/governance", "Governance", "The committee, the constitution and how the Union is run."],
  ["/debates", "Debates", "Every past debate, results and the archive."],
  ["/term-card", "Term Card", "This term’s debates and events, calendar, dates and tickets."],
  ["/membership", "Membership", "Join the King’s Union: member benefits, reserved tickets, a vote at the AGM."],
  ["/kingsway", "Kingsway", "Kingsway, the magazine of the King’s Union: articles, op-eds and writing for us."],
  ["/support", "Support Us", "Sponsors, partners and supporting the Union."],
  ["/speak", "Speak at the Union", "Invitations to speak, guest speakers, how a debate runs."],
  ["/speak/apply", "Apply to speak", "King’s students can apply to speak in a debate."],
  ["/get-involved", "Get involved", "Ways to take part in the Union."],
  ["/motions", "Suggest a motion", "Propose a motion for a future debate and upvote others."],
  ["/votes", "How King’s votes", "Every division, results, turnout and voting by topic."],
  ["/records", "Records", "The record book: biggest House, closest vote, longest run."],
  ["/speakers", "Speakers", "Everyone who has spoken at the Union, guests and students."],
  ["/guide", "How to debate", "A guide for first-timers: points of information, speaking from the floor, building a case."],
  ["/friends", "Friends of the Union", "Alumni, staff and supporters: stay in touch."],
  ["/press", "Press", "Press and media information."],
  ["/contact", "Contact us", "Email the Union, get in touch, or apply to write for Kingsway."],
  ["/privacy", "Privacy", "How we use your information, cookies, visitor statistics."],
  ["/#mailing-list", "Ticket alerts", "Get an email when tickets go on sale."],
];

// Lower case, without accents or curly quotes, so "Tomas" finds "Tomás".
export const norm = (s) =>
  String(s || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();

async function documents() {
  const [events, past, speakers, posts] = await Promise.all([
    getEvents().catch(() => []),
    getPastDebates().catch(() => []),
    getSpeakerDirectory().catch(() => []),
    getKingswayPosts(50).catch(() => []),
  ]);
  const docs = [];
  for (const e of events) {
    const speakers = e.chathamHouse ? [] : [...(e.proposition || []), ...(e.opposition || [])];
    docs.push({
      group: e.type === "Debate" ? "Debates" : "Events",
      title: e.title,
      href: `/events/${e.slug}`,
      meta: [displayDate(e.date), e.type !== "Debate" ? e.type : "", e.venue].filter(Boolean).join(" · "),
      text: [e.description, e.venue, speakers.join(", "), e.type].join(" "),
      date: e.date,
    });
  }
  // Older debates from before the term card, which have no page of their own.
  const known = new Set(events.map((e) => norm(e.title)));
  for (const d of past) {
    if (d.href || known.has(norm(d.title))) continue;
    docs.push({ group: "Debates", title: d.title, href: "/debates", meta: displayDate(d.date), text: d.description || "", date: d.date });
  }
  for (const s of speakers) {
    docs.push({
      group: "Speakers",
      title: s.name,
      href: `/speakers#${s.slug}`,
      meta: [s.title || (s.student ? "King’s student" : "Guest speaker"), `${s.debates.length} debate${s.debates.length === 1 ? "" : "s"}`].join(" · "),
      text: s.debates.map((d) => d.title).join(" "),
      quiet: true,
    });
  }
  for (const p of profiles) {
    docs.push({ group: "Committee", title: p.name, href: `/team/${p.slug}`, meta: p.role || "", quiet: true, text: [p.role, ...(Array.isArray(p.bio) ? p.bio : [p.bio])].filter(Boolean).join(" ") });
  }
  for (const [href, title, text] of PAGES) docs.push({ group: "Pages", title, href, meta: "", text });
  for (const s of guideSections) {
    docs.push({
      group: "Pages",
      title: `How to debate: ${s.title}`,
      href: `/guide#${s.id}`,
      meta: "",
      text: [...(s.paras || []), ...(s.tips || []), ...(s.terms || []).flat()].join(" "),
    });
  }
  for (const f of faq) docs.push({ group: "Questions", title: f.q, href: "/#faq", meta: "", text: f.a });
  for (const p of posts) {
    docs.push({ group: "Kingsway", title: p.title, href: p.link, meta: p.date ? `Kingsway · ${displayDate(p.date)}` : "Kingsway", text: p.description || "", external: true, date: p.date });
  }
  return docs;
}

const GROUP_ORDER = ["Debates", "Speakers", "Pages", "Questions", "Events", "Kingsway", "Committee"];

// Every word typed must appear somewhere; matches in the title count most.
export async function search(query, limit = 60) {
  const words = norm(query).split(/[^a-z0-9'£%]+/).filter((w) => w.length > 0).slice(0, 8);
  if (!words.length) return { words, total: 0, groups: [] };
  const scored = [];
  for (const d of await documents()) {
    const title = norm(d.title);
    const all = `${title} ${norm(d.meta)} ${norm(d.text)}`;
    if (!words.every((w) => all.includes(w))) continue;
    let score = 0;
    for (const w of words) {
      if (new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) score += 6;
      else if (title.includes(w)) score += 3;
      else score += 1;
    }
    if (title === norm(query).trim()) score += 10;
    scored.push({ ...d, score });
  }
  scored.sort((a, b) => b.score - a.score || String(b.date || "").localeCompare(String(a.date || "")));
  const top = scored.slice(0, limit);
  const groups = GROUP_ORDER.map((g) => ({ group: g, items: top.filter((d) => d.group === g) })).filter((g) => g.items.length);
  return { words, total: scored.length, groups };
}

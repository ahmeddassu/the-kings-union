// The speaker pack: a page for invited guest speakers (/speaker-pack), not
// linked from the site's menus. Sent as a link, optionally for one debate
// (/speaker-pack?debate=<slug>), which adds that debate's motion, date, time,
// venue and line-up. The text is edited by Events and Programming in
// admin → Speaker pack.
//
// Key: ku:speaker-pack   JSON { sections: [{ title, body }], updatedAt }
import { revalidatePath, revalidateTag } from "next/cache";
import { redis, cachedGet } from "@/lib/store";
import { UNION_EMAIL } from "@/lib/contact";

const KEY = "ku:speaker-pack";
const MAX_SECTIONS = 15;

// Starting text, taken from what the Union already says publicly.
export const DEFAULT_SECTIONS = [
  {
    title: "How the debate runs",
    body: "Each debate has three speakers proposing the motion and three opposing it, usually a mix of guests and students.\n\nMembers of the floor can rise to challenge a speaker mid-speech with a point of information. Once the main speeches are done, the debate is opened to the floor and anyone in the audience can make a point.\n\nThe House then divides: the audience votes, and the result is announced from the chair as Ayes and Noes.",
  },
  { title: "How long it lasts", body: "About two hours, including the vote at the end." },
  { title: "What to wear", body: "There’s no dress code, but we recommend dressing formally." },
  {
    title: "Chatham House Rule",
    body: "If you’d prefer, we can hold the debate under the Chatham House Rule: what is said can be reported, but not who said it, and we don’t publish the speakers.",
  },
  {
    title: "Before the night",
    body: "We’ll confirm your arrival time and who will meet you by email. If you have access requirements, or anything else we should know, tell us and we’ll arrange it.",
  },
  { title: "Questions", body: `Email ${UNION_EMAIL} and we’ll get back to you.` },
];

const clean = (s, max) => String(s ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);

export async function getPack() {
  try {
    const raw = await cachedGet(KEY, 300);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to the starting text
  }
  return { sections: DEFAULT_SECTIONS, updatedAt: null };
}

export async function getPackForAdmin() {
  const raw = await redis("GET", KEY);
  return raw ? JSON.parse(raw) : { sections: DEFAULT_SECTIONS, updatedAt: null };
}

export async function savePack(input) {
  const sections = (Array.isArray(input?.sections) ? input.sections : [])
    .map((s) => ({ title: clean(s.title, 80).replace(/\s+/g, " "), body: clean(s.body, 3000) }))
    .filter((s) => s.title || s.body)
    .slice(0, MAX_SECTIONS);
  if (!sections.length) throw new Error("The pack needs at least one section.");
  if (sections.some((s) => !s.title)) throw new Error("Every section needs a heading.");
  const pack = { sections, updatedAt: Date.now() };
  await redis("SET", KEY, JSON.stringify(pack));
  try {
    revalidateTag(`store:${KEY}`, { expire: 0 });
    revalidatePath("/speaker-pack");
  } catch {
    // outside a request
  }
  return pack;
}

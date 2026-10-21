// Everyone who has spoken at the Union, for the Speakers page (/speakers).
//
// Names and debates come straight from the term card (the Google Sheet, or
// lib/events.js), so there's nothing to keep in step by hand. The Events team
// can add a photo, a one-line title ("Economist and broadcaster") and a link for
// each speaker under admin → Past speakers, or hide someone from the page.
// Chatham House debates are left out, as their speakers aren't published.
//
// Keys:
//   ku:speaker-profiles          JSON object: speaker slug → { title, href, photo, hidden }
//   ku:speaker-photo:<slug>      the photo (base64 JPEG/PNG/WebP)
import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redis, cachedGet, storeConfigured } from "@/lib/store";
import { getEvents, slugify } from "@/lib/sheet";
import { KINGS_STUDENTS } from "@/lib/speakers";

const PROFILES = "ku:speaker-profiles";
const photoKey = (slug) => `ku:speaker-photo:${slug}`;
const MAX_PHOTO_BYTES = 300 * 1024;

export const isSpeakerSlug = (s) => /^[a-z0-9-]{1,80}$/.test(String(s || ""));
export const speakerSlug = (name) => slugify(String(name || "")).replace(/^-+|-+$/g, "");

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const londonToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

async function readProfiles(fresh = false) {
  try {
    const raw = fresh ? (storeConfigured ? await redis("GET", PROFILES) : null) : await cachedGet(PROFILES, 300);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const photoUrl = (slug, p) => (p?.photo ? `/api/speakers/${slug}/photo?v=${p.photo}` : "");

// Who won the vote: "carried", "defeated", or "" if there's no result yet.
function outcome(result) {
  if (!result) return "";
  return result.proposition > result.opposition ? "carried" : "defeated";
}

// Everyone who has spoken in a debate that has already happened, each with the
// debates they spoke in (newest first). `includeHidden` is for admin.
export async function getSpeakerDirectory({ includeHidden = false, fresh = false } = {}) {
  const today = londonToday();
  const events = (await getEvents())
    .filter((e) => e.type === "Debate" && !e.chathamHouse && e.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const profiles = await readProfiles(fresh);

  const people = new Map();
  for (const e of events) {
    const sides = [
      ["Proposition", e.proposition || []],
      ["Opposition", e.opposition || []],
    ];
    for (const [side, names] of sides) {
      for (const name of names) {
        const slug = speakerSlug(name);
        if (!slug) continue;
        if (!people.has(slug)) {
          const p = profiles[slug] || {};
          people.set(slug, {
            slug,
            name,
            student: KINGS_STUDENTS.includes(name),
            title: p.title || "",
            href: p.href || "",
            photo: photoUrl(slug, p),
            hidden: Boolean(p.hidden),
            debates: [],
          });
        }
        const result = outcome(e.result);
        people.get(slug).debates.push({
          slug: e.slug,
          title: e.title,
          date: e.date,
          side,
          result,
          won: result ? (side === "Proposition") === (result === "carried") : null,
          votes: e.result || null,
        });
      }
    }
  }
  const all = [...people.values()];
  return includeHidden ? all : all.filter((p) => !p.hidden);
}

async function saveProfiles(profiles) {
  await redis("SET", PROFILES, JSON.stringify(profiles));
  try {
    revalidateTag(`store:${PROFILES}`, { expire: 0 });
    revalidatePath("/speakers");
  } catch {
    // outside a request: the page catches up within five minutes
  }
}

// Saves the title, link and hidden setting for one speaker.
export async function updateProfile(slug, input) {
  if (!isSpeakerSlug(slug)) return null;
  const href = clean(input.href, 300);
  if (href && !/^https:\/\//.test(href)) throw new Error("The link must start with https://");
  const profiles = await readProfiles(true);
  profiles[slug] = {
    ...(profiles[slug] || {}),
    title: clean(input.title, 120),
    href,
    hidden: Boolean(input.hidden),
  };
  await saveProfiles(profiles);
  return profiles[slug];
}

// ---------- Photos ----------

function imageType(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function setPhoto(slug, buffer) {
  if (!isSpeakerSlug(slug)) return null;
  const buf = Buffer.from(buffer);
  if (!buf.length) throw new Error("That file is empty.");
  if (buf.length > MAX_PHOTO_BYTES) throw new Error("That photo is too big. Try a smaller image.");
  const type = imageType(buf);
  if (!type) throw new Error("Please upload a JPG, PNG or WebP image.");
  const profiles = await readProfiles(true);
  const version = randomBytes(4).toString("hex");
  await redis("SET", photoKey(slug), JSON.stringify({ type, data: buf.toString("base64") }));
  profiles[slug] = { ...(profiles[slug] || {}), photo: version };
  await saveProfiles(profiles);
  return photoUrl(slug, profiles[slug]);
}

export async function removePhoto(slug) {
  if (!isSpeakerSlug(slug)) return null;
  const profiles = await readProfiles(true);
  await redis("DEL", photoKey(slug));
  profiles[slug] = { ...(profiles[slug] || {}), photo: null };
  await saveProfiles(profiles);
  return "";
}

export async function getPhoto(slug) {
  if (!isSpeakerSlug(slug)) return null;
  const raw = await redis("GET", photoKey(slug));
  if (!raw) return null;
  const { type, data } = JSON.parse(raw);
  return { type, body: Buffer.from(data, "base64") };
}

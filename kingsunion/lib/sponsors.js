// Sponsors and partners, shown on the Support page, the homepage strip and the
// Press page. Managed by Finance (and the Executive) under admin → Sponsors.
// The first sponsor in the list is shown large as the lead partner.
//
// Logos are uploaded in admin. The browser shrinks them to a small PNG first,
// and they're kept in the database (no separate file storage needed) and
// served from /api/sponsors/<id>/logo.
//
// Keys:
//   ku:sponsors            JSON list, in display order
//   ku:sponsor-logo:<id>   the logo (base64 PNG/JPEG/WebP)
import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redis, cachedGet, storeConfigured } from "@/lib/store";
import { partners as starting } from "@/lib/partners";

const LIST = "ku:sponsors";
const logoKey = (id) => `ku:sponsor-logo:${id}`;
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));
const MAX_LOGO_BYTES = 400 * 1024;
const MAX_SPONSORS = 40;

export const TIERS = ["Principal partner", "Partner", "Supporter", "Media partner", "Venue partner"];

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Before anyone has edited the list, start from the partners already on the site.
const seed = () =>
  starting.map((p, i) => ({
    id: ["5f5e2a1c0d01", "5f5e2a1c0d02", "5f5e2a1c0d03"][i] || randomBytes(6).toString("hex"),
    name: p.name,
    tier: p.tier || "Partner",
    description: p.description || "",
    href: p.href || "",
    logo: null,
    hidden: false,
  }));

const publicLogo = (s) => (s.logo ? `/api/sponsors/${s.id}/logo?v=${s.logo}` : "");

// For the website: visible sponsors, with logo addresses. Never fails.
export async function getSponsors() {
  let list = null;
  try {
    const raw = await cachedGet(LIST, 300);
    if (raw) list = JSON.parse(raw);
  } catch {
    list = null;
  }
  return (list || seed()).filter((s) => !s.hidden).map((s) => ({ ...s, logo: publicLogo(s) }));
}

// For admin: everything, including hidden ones.
export async function listSponsors() {
  const raw = storeConfigured ? await redis("GET", LIST) : null;
  const list = raw ? JSON.parse(raw) : seed();
  return list.map((s) => ({ ...s, logoUrl: publicLogo(s) }));
}

async function saveList(list) {
  await redis("SET", LIST, JSON.stringify(list.map(({ logoUrl, ...s }) => s)));
  try {
    revalidateTag(`store:${LIST}`, { expire: 0 });
    for (const p of ["/", "/support", "/press"]) revalidatePath(p);
  } catch {
    // outside a request: the site catches up within five minutes
  }
}

function fields(input) {
  const name = clean(input.name, 80);
  if (!name) throw new Error("Please add the sponsor’s name.");
  const href = clean(input.href, 300);
  if (href && !/^https:\/\//.test(href)) throw new Error("The website link must start with https://");
  return {
    name,
    tier: TIERS.includes(input.tier) ? input.tier : "Partner",
    description: String(input.description ?? "").trim().slice(0, 400),
    href,
    hidden: Boolean(input.hidden),
  };
}

export async function addSponsor(input) {
  const list = await listSponsors();
  if (list.length >= MAX_SPONSORS) throw new Error("That’s the maximum number of sponsors.");
  const s = { id: randomBytes(6).toString("hex"), ...fields(input), logo: null };
  await saveList([...list, s]);
  return { ...s, logoUrl: "" };
}

export async function updateSponsor(id, input) {
  const list = await listSponsors();
  const i = list.findIndex((s) => s.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...fields({ ...list[i], ...input }) };
  await saveList(list);
  return { ...list[i], logoUrl: publicLogo(list[i]) };
}

export async function moveSponsor(id, direction) {
  const list = await listSponsors();
  const i = list.findIndex((s) => s.id === id);
  const j = i + (direction === "up" ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return list;
  [list[i], list[j]] = [list[j], list[i]];
  await saveList(list);
  return list;
}

export async function deleteSponsor(id) {
  const list = await listSponsors();
  if (!list.some((s) => s.id === id)) return false;
  await saveList(list.filter((s) => s.id !== id));
  await redis("DEL", logoKey(id));
  return true;
}

// ---------- Logos ----------

function imageType(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function setLogo(id, buffer) {
  const buf = Buffer.from(buffer);
  if (!buf.length) throw new Error("That file is empty.");
  if (buf.length > MAX_LOGO_BYTES) throw new Error("That logo is too big. Try a smaller image.");
  const type = imageType(buf);
  if (!type) throw new Error("Please upload a PNG, JPG or WebP image.");
  const list = await listSponsors();
  const i = list.findIndex((s) => s.id === id);
  if (i < 0) return null;
  const version = randomBytes(4).toString("hex");
  await redis("SET", logoKey(id), JSON.stringify({ type, data: buf.toString("base64") }));
  list[i] = { ...list[i], logo: version };
  await saveList(list);
  return { ...list[i], logoUrl: publicLogo(list[i]) };
}

export async function removeLogo(id) {
  const list = await listSponsors();
  const i = list.findIndex((s) => s.id === id);
  if (i < 0) return null;
  await redis("DEL", logoKey(id));
  list[i] = { ...list[i], logo: null };
  await saveList(list);
  return { ...list[i], logoUrl: "" };
}

export async function getLogo(id) {
  if (!isId(id)) return null;
  const raw = await redis("GET", logoKey(id));
  if (!raw) return null;
  const { type, data } = JSON.parse(raw);
  return { type, body: Buffer.from(data, "base64") };
}

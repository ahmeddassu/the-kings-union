// The committee team directory (admin → Dashboard → Team directory). It used
// to be the Team Structure tab of the dashboard Google Sheet; it was copied in
// once and now lives here. The Executive (and super admins) edit it; anyone
// can update their own WhatsApp number and email.
//
// Keys:
//   ku:team            hash: member id → JSON { id, name, role, departments, unit, whatsapp, email, createdAt, updatedAt, updatedBy }
//   ku:team-imported   set once the sheet's Team Structure has been copied in
import { randomBytes } from "node:crypto";
import { redis, pipeline } from "@/lib/store";
import { DEPARTMENTS, getSheetTeam } from "@/lib/dashboard";

const KEY = "ku:team";
const IMPORTED = "ku:team-imported";
const MAX_MEMBERS = 300;

// Departments people can belong to (task departments plus Technology).
export const TEAM_DEPARTMENTS = [...DEPARTMENTS, "Technology"];

const oneLine = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const isId = (s) => /^[a-f0-9]{12}$/.test(String(s || ""));
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function toMap(reply) {
  if (!reply) return {};
  if (!Array.isArray(reply)) return { ...reply };
  const out = {};
  for (let i = 0; i < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

export async function listTeam() {
  const raw = toMap(await redis("HGETALL", KEY));
  const out = [];
  for (const json of Object.values(raw)) {
    try {
      out.push(JSON.parse(json));
    } catch {
      // skip a damaged record
    }
  }
  return out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
}

export async function findMember(id) {
  if (!isId(id)) return null;
  const json = await redis("HGET", KEY, id);
  return json ? JSON.parse(json) : null;
}

function checked(input, { contactOnly = false } = {}) {
  const out = {};
  const whatsapp = oneLine(input.whatsapp, 30);
  if (whatsapp && !/^\+?[\d ()-]{6,30}$/.test(whatsapp)) throw new Error("That WhatsApp number doesn’t look right.");
  const email = oneLine(input.email, 120);
  if (email && !isEmail(email)) throw new Error("That email address doesn’t look right.");
  out.whatsapp = whatsapp;
  out.email = email;
  if (contactOnly) return out;
  out.name = oneLine(input.name, 80);
  if (!out.name) throw new Error("Give their name.");
  out.role = oneLine(input.role, 160);
  out.unit = oneLine(input.unit, 80);
  out.departments = [...new Set((Array.isArray(input.departments) ? input.departments : []).filter((d) => TEAM_DEPARTMENTS.includes(d)))];
  return out;
}

// Adds someone (no id) or changes them. `contactOnly` is for people editing
// their own entry, who can only change their WhatsApp number and email.
export async function saveMember(input, admin, { contactOnly = false } = {}) {
  const fields = checked(input || {}, { contactOnly });
  const now = Date.now();
  if (input?.id) {
    const current = await findMember(input.id);
    if (!current) throw new Error("That person has been removed. Refresh the page.");
    const next = { ...current, ...fields, updatedAt: now, updatedBy: admin.name };
    await redis("HSET", KEY, current.id, JSON.stringify(next));
    return { before: current, member: next };
  }
  if (contactOnly) throw new Error("Only the Executive can add people.");
  if (Number(await redis("HLEN", KEY)) >= MAX_MEMBERS) throw new Error("The team directory is full.");
  const member = { id: randomBytes(6).toString("hex"), ...fields, order: now, createdAt: now, updatedAt: now, updatedBy: admin.name };
  await redis("HSET", KEY, member.id, JSON.stringify(member));
  return { before: null, member };
}

export async function removeMember(id) {
  const current = await findMember(id);
  if (!current) return null;
  await redis("HDEL", KEY, id);
  return current;
}

// ---------- Copying the team in from the sheet ----------

async function importTeam() {
  const { team, error } = await getSheetTeam();
  if (error) throw new Error(error);
  // Someone listed on two rows (one per department) becomes one person.
  const merged = [];
  for (const p of team) {
    const key = p.name.toLowerCase().replace(/\s+/g, " ").trim();
    const same = merged.find((m) => m.key === key);
    if (!same) {
      merged.push({ ...p, key, departments: [...p.departments] });
      continue;
    }
    const roles = [same.role, p.role].flatMap((r) => String(r || "").split(",")).map((r) => r.trim()).filter(Boolean);
    same.role = [...new Set(roles)].join(", ");
    same.departments = [...new Set([...same.departments, ...p.departments])];
    same.unit = same.unit || p.unit;
    same.whatsapp = same.whatsapp || p.whatsapp;
    same.email = same.email || p.email;
  }
  const now = Date.now();
  const commands = merged.map((p, i) => {
    const id = randomBytes(6).toString("hex");
    const member = {
      id,
      name: oneLine(p.name, 80),
      role: oneLine(p.role, 160),
      departments: p.departments.filter((d) => TEAM_DEPARTMENTS.includes(d)),
      unit: oneLine(p.unit, 80),
      // Numbers in the sheet were written without the leading 0 or "+".
      whatsapp: oneLine(p.whatsapp, 30),
      email: isEmail(p.email) ? oneLine(p.email, 120) : "",
      order: i,
      createdAt: now,
      updatedAt: now,
      updatedBy: "Copied from the dashboard sheet",
    };
    return ["HSET", KEY, id, JSON.stringify(member)];
  });
  if (commands.length) await pipeline(commands);
  return commands.length;
}

async function importOnce() {
  if (Number(await redis("HLEN", KEY))) return 0;
  const first = await redis("SET", IMPORTED, String(Date.now()), "NX");
  if (!first) return 0;
  try {
    return await importTeam();
  } catch (err) {
    await redis("DEL", IMPORTED); // try again next time
    throw err;
  }
}

// The whole team, as { team, error }.
export async function getTeam() {
  let error = "";
  await importOnce().catch((err) => {
    error = `The team couldn’t be copied from the dashboard sheet (${err?.message || "error"}). Add people under Team directory.`;
  });
  return { team: await listTeam(), error };
}

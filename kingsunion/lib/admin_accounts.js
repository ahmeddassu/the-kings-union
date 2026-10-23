// Committee logins, managed by the Executive under admin → People.
//
// Adding someone gives a one-off setup link (valid 7 days) for them to choose
// their own password; nobody else ever sees it. The same kind of link resets a
// forgotten password.
//
// Keys:
//   ku:admins              hash id -> person (JSON: name, email, team, password fingerprint…)
//   ku:admin-setup:<token> id of the person the setup link is for (expires)
//   ku:admin-settings      hash: shared = "off" when the shared password is switched off
import { randomBytes } from "node:crypto";
import { redis, pipeline } from "@/lib/store";
import { TEAMS, hashPassword, checkPassword, teamsOf, isSuperEmail } from "@/lib/admin_auth";

const KEY = "ku:admins";
const SETUP_DAYS = 7;
const isId = (id) => /^[a-f0-9]{12}$/.test(String(id || ""));
const isToken = (t) => /^[a-f0-9]{48}$/.test(String(t || ""));
const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
export const MIN_PASSWORD = 10;

// What the People page shows (never the password fingerprint).
const publicView = ({ hash, salt, ...p }) => {
  const teams = teamsOf(p);
  return { ...p, team: teams[0], teams, superAdmin: isSuperEmail(p.email), status: p.disabled ? "disabled" : hash ? "active" : "invited" };
};

// The teams asked for ({ teams: [...] }, or one { team }), checked. Never "super".
function chosenTeams(input) {
  const asked = Array.isArray(input.teams) ? input.teams : input.team !== undefined ? [input.team] : [];
  return asked.filter((t, i) => TEAMS[t] && t !== "super" && asked.indexOf(t) === i);
}
const isExec = (p) => teamsOf(p).some((t) => t === "executive" || t === "super");

export async function listPeople() {
  const raw = (await redis("HVALS", KEY)) || [];
  return raw
    .map((r) => JSON.parse(r))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(publicView);
}

async function getPerson(id) {
  if (!isId(id)) return null;
  const raw = await redis("HGET", KEY, id);
  return raw ? JSON.parse(raw) : null;
}

const save = (p) => redis("HSET", KEY, p.id, JSON.stringify(p));

async function findByEmail(email) {
  const raw = (await redis("HVALS", KEY)) || [];
  return raw.map((r) => JSON.parse(r)).find((p) => p.email === email) || null;
}

async function newSetupToken(id) {
  const token = randomBytes(24).toString("hex");
  await redis("SET", `ku:admin-setup:${token}`, id, "EX", SETUP_DAYS * 86400);
  return token;
}

export async function addPerson(input) {
  const name = clean(input.name, 80);
  const email = clean(input.email, 160).toLowerCase();
  const teams = chosenTeams(input);
  if (!name) throw new Error("Please add their name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please add a valid email address.");
  if (!teams.length) throw new Error("Please choose at least one team.");
  if (await findByEmail(email)) throw new Error("Someone with that email already has a login.");
  if ((Number(await redis("HLEN", KEY)) || 0) >= 200) throw new Error("That’s the maximum number of logins.");
  const person = { id: randomBytes(6).toString("hex"), name, email, team: teams[0], teams, sv: 0, createdAt: Date.now(), disabled: false, lastLogin: null };
  await save(person);
  return { person: publicView(person), token: await newSetupToken(person.id) };
}

// Who a setup link is for (or null if it's wrong or expired).
export async function setupFor(token) {
  if (!isToken(token)) return null;
  const id = await redis("GET", `ku:admin-setup:${token}`);
  const p = id ? await getPerson(id) : null;
  return p && !p.disabled ? p : null;
}

export async function completeSetup(token, password) {
  const p = await setupFor(token);
  if (!p) throw new Error("That link has expired or already been used. Ask the Executive for a new one.");
  if (String(password || "").length < MIN_PASSWORD) throw new Error(`Please use at least ${MIN_PASSWORD} characters.`);
  const { salt, hash } = hashPassword(password);
  const updated = { ...p, salt, hash, sv: (p.sv || 0) + 1, lastLogin: Date.now() };
  await pipeline([["HSET", KEY, p.id, JSON.stringify(updated)], ["DEL", `ku:admin-setup:${token}`]]);
  return updated;
}

// Sign in with email and password. Returns the person, or null.
export async function signIn(email, password) {
  const p = await findByEmail(clean(email, 160).toLowerCase());
  if (!p || !p.hash || p.disabled) {
    hashPassword(password); // same delay either way, so emails can't be probed
    return null;
  }
  if (!checkPassword(password, p.salt, p.hash)) return null;
  const updated = { ...p, lastLogin: Date.now() };
  await save(updated);
  return updated;
}

async function activeExecutives(exceptId) {
  const raw = (await redis("HVALS", KEY)) || [];
  return raw.map((r) => JSON.parse(r)).filter((p) => isExec(p) && p.hash && !p.disabled && p.id !== exceptId).length;
}

// Someone must always be able to manage logins.
async function guardLastExecutive(p, sharedOn) {
  if (isExec(p) && !sharedOn && (await activeExecutives(p.id)) === 0) {
    throw new Error("They’re the only Executive who can sign in. Add another Executive first, or switch the shared password back on.");
  }
}

// Super admins can only be changed by another super admin (and their level
// only from Vercel).
function guardSuper(p, actor) {
  if (isSuperEmail(p.email) && !actor?.teams?.includes("super") && actor?.team !== "super") throw new Error("Only a super admin can change a super admin’s login.");
}

export async function updatePerson(id, change, sharedOn, actor) {
  const p = await getPerson(id);
  if (!p) return null;
  guardSuper(p, actor);
  let updated = { ...p };
  let token = null;
  if (change.teams !== undefined || change.team !== undefined) {
    const teams = chosenTeams(change);
    if (!teams.length) throw new Error("Please choose at least one team.");
    if (isSuperEmail(p.email)) throw new Error("Super admins are set by the site’s developers, not here.");
    if (!teams.includes("executive")) await guardLastExecutive(p, sharedOn);
    updated.teams = teams;
    updated.team = teams[0];
  }
  if (change.disabled !== undefined) {
    if (change.disabled) await guardLastExecutive(p, sharedOn);
    updated.disabled = Boolean(change.disabled);
    updated.sv = (p.sv || 0) + 1; // signs them out
  }
  if (change.resetPassword) {
    updated = { ...updated, hash: null, salt: null, sv: (p.sv || 0) + 1 };
    if (p.hash) await guardLastExecutive(p, sharedOn);
    token = await newSetupToken(p.id);
  }
  await save(updated);
  return { person: publicView(updated), token };
}

export async function removePerson(id, sharedOn, actor) {
  const p = await getPerson(id);
  if (!p) return false;
  guardSuper(p, actor);
  await guardLastExecutive(p, sharedOn);
  return Number(await redis("HDEL", KEY, id)) === 1;
}

export async function setShared(on) {
  if (!on && (await activeExecutives(null)) === 0) {
    throw new Error("Add an Executive login (and have them set their password) before switching the shared password off.");
  }
  await redis("HSET", "ku:admin-settings", "shared", on ? "on" : "off");
}

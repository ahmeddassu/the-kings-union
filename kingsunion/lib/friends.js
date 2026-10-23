// Friends of the Union: alumni, staff and supporters who'd like to stay in
// touch, kept separately from ticket alerts. A starting point for patrons,
// alumni events and future fundraising. Managed in admin → Friends.
//
// Key: ku:friends   hash email -> JSON { name, email, connection, year, interests, at }
import { redis } from "@/lib/store";

const KEY = "ku:friends";
export const CONNECTIONS = ["King’s alumnus", "Former committee member", "King’s staff", "Current student", "Supporter"];
export const INTERESTS = ["Hearing the Union’s news", "Coming to events", "Speaking at a debate", "Mentoring students", "Supporting the Union financially"];

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function friendFields(input) {
  const email = clean(input.email, 200).toLowerCase();
  const name = clean(input.name, 120);
  if (!name) throw new Error("name");
  if (!EMAIL.test(email)) throw new Error("email");
  if (!input.consent) throw new Error("consent");
  const year = clean(input.year, 4);
  return {
    name,
    email,
    connection: CONNECTIONS.includes(input.connection) ? input.connection : "Supporter",
    year: /^(19|20)\d\d$/.test(year) ? year : "",
    interests: (Array.isArray(input.interests) ? input.interests : [input.interests]).filter((i) => INTERESTS.includes(i)),
    at: Date.now(),
  };
}

// Adds someone, or updates them if they sign up again.
export async function addFriend(input) {
  const f = friendFields(input);
  await redis("HSET", KEY, f.email, JSON.stringify(f));
  return f;
}

export async function listFriends() {
  const raw = (await redis("HVALS", KEY)) || [];
  return raw.map((r) => JSON.parse(r)).sort((a, b) => b.at - a.at);
}

export async function removeFriend(email) {
  return Boolean(await redis("HDEL", KEY, String(email || "").toLowerCase()));
}

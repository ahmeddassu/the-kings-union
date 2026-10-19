// Admin sign-in for admin.kingsunion.org.uk.
//
// The password itself is never stored: only a salted scrypt fingerprint, which is
// slow to guess. To change the password, run this (with your new password) and
// replace SALT and HASH below:
//   node -e "const c=require('crypto'),s=c.randomBytes(16).toString('hex');console.log(s, c.scryptSync('NEW-PASSWORD',s,32,{N:32768,r:8,p:1,maxmem:67108864}).toString('hex'))"
// Changing it signs every admin out.
import { scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redis, storeConfigured } from "@/lib/store";

const SALT = "fdb80112cb0c051192c86b6253e34f61";
const HASH = "cc697fe1ffd2d3831ab4322c7a25467bbe2de37a7f9de47470296290e7e6d1f4";
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const ADMIN_COOKIE = "ku_admin";
const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 10; // per 15 minutes, per network address

export function passwordMatches(password) {
  const attempt = scryptSync(String(password || ""), SALT, 32, SCRYPT);
  return timingSafeEqual(attempt, Buffer.from(HASH, "hex"));
}

// Sessions are signed with a server-only secret (the database token, which is
// never in the code), so they can't be forged.
function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_URL ||
    process.env.KV_URL ||
    ""
  );
}

function sign(value) {
  return createHmac("sha256", secret()).update(`${value}.${HASH}`).digest("hex");
}

export function newSession() {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  return { value: `${expires}.${sign(expires)}`, maxAge: SESSION_HOURS * 3600 };
}

export function sessionValid(token) {
  if (!secret() || typeof token !== "string") return false;
  const [expires, sig] = token.split(".");
  if (!/^\d+$/.test(expires || "") || !/^[a-f0-9]{64}$/.test(sig || "")) return false;
  if (Number(expires) < Date.now()) return false;
  return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(sign(expires), "hex"));
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return sessionValid(token);
}

// Slows down password guessing. Returns true if this address may try again.
export async function allowLoginAttempt(ip) {
  if (!storeConfigured) return true;
  const key = `ku:login:${ip || "unknown"}`;
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 900);
  return n <= MAX_ATTEMPTS;
}

export async function clearLoginAttempts(ip) {
  if (storeConfigured) await redis("DEL", `ku:login:${ip || "unknown"}`);
}

export function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

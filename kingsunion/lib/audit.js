// Activity log: who did what in admin, shown to the Executive under Activity.
// Keeps the most recent 2,000 actions.
//
// Key: ku:audit  list of JSON { at, by, team, action }
import { redis } from "@/lib/store";
import { TEAMS } from "@/lib/admin_auth";

const KEY = "ku:audit";
const KEEP = 2000;

export async function logAction(admin, action) {
  if (!admin) return;
  try {
    const entry = { at: Date.now(), by: admin.name, team: admin.team, teamLabel: admin.teamLabel || TEAMS[admin.team]?.label || admin.team, action: String(action).slice(0, 300) };
    await redis("LPUSH", KEY, JSON.stringify(entry));
    await redis("LTRIM", KEY, 0, KEEP - 1);
  } catch (err) {
    console.error("Couldn't log admin action:", err);
  }
}

export async function listActions(limit = 500) {
  const raw = (await redis("LRANGE", KEY, 0, limit - 1)) || [];
  return raw.map((r) => {
    const e = JSON.parse(r);
    return { ...e, teamLabel: e.teamLabel || TEAMS[e.team]?.label || e.team };
  });
}

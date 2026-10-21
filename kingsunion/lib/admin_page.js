// Shared start of every signed-in admin page: sends people who aren't signed in
// back to the sign-in screen, and people whose team can't use this section to
// the first section they can use.
import { redirect } from "next/navigation";
import { getAdmin, SECTIONS } from "@/lib/admin_auth";
import { basePath } from "@/lib/hosts";
import { storeConfigured } from "@/lib/store";

// `section` may be one name or a list (any of them is enough).
export async function requireAdmin(section) {
  const base = await basePath("admin");
  const admin = storeConfigured ? await getAdmin() : null;
  if (!admin) redirect(base || "/");
  const needed = [].concat(section || []);
  if (needed.length && !needed.some((s) => admin.can(s))) redirect(`${base}${homeFor(admin)}` || "/");
  return base;
}

// Where someone lands after signing in: their team's first section.
export function homeFor(admin) {
  if (admin.can("debates")) return "";
  const first = admin.sections.find((s) => SECTIONS[s]);
  return SECTIONS[first]?.path || "";
}

// Yesterday's date in London, as YYYY-MM-DD.
export function yesterdayInLondon() {
  return new Date(Date.now() - 86400000).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

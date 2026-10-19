// Shared start of every signed-in admin page: sends people who aren't signed in
// back to the sign-in screen.
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin_auth";
import { basePath } from "@/lib/hosts";
import { storeConfigured } from "@/lib/store";

export async function requireAdmin() {
  const base = await basePath("admin");
  if (!storeConfigured || !(await isAdmin())) redirect(base || "/");
  return base;
}

// Yesterday's date in London, as YYYY-MM-DD.
export function yesterdayInLondon() {
  return new Date(Date.now() - 86400000).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// Debates still to come this term (from the term card).
import { getEvents } from "@/lib/sheet";

export function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

export async function upcomingDebates() {
  const today = todayInLondon();
  return (await getEvents()).filter((e) => e.type === "Debate" && e.date >= today);
}

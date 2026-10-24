// Morning job: the day-before reminders to the ticket-alerts list (lib/reminders.js).
// Runs a few times each morning (vercel.json) so long lists finish sending.
// If CRON_SECRET is set in Vercel, only Vercel's scheduler can run it.
import { runReminders } from "@/lib/reminders";
import { storeConfigured } from "@/lib/store";
import { notifyOverdue } from "@/lib/notifications";
import { listTasks } from "@/lib/tasks";
import { listTeam } from "@/lib/team";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Not allowed", { status: 401 });
  if (!storeConfigured) return Response.json({ skipped: "Database isn’t connected." });
  // Overdue tasks: a notification in admin to each owner and supervisor (once per deadline).
  const overdue = await notifyOverdue(await listTasks().catch(() => []), await listTeam().catch(() => [])).catch(() => 0);
  try {
    return Response.json({ ...(await runReminders()), overdueNotified: overdue });
  } catch (err) {
    console.error("Reminders failed:", err);
    return Response.json({ error: "Reminders failed." }, { status: 500 });
  }
}

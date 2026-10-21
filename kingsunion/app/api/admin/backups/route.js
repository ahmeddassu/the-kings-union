// Admin: GET lists stored backups; POST makes one now.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { listBackups, saveBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const admin = await can("backups");
  if (!admin) return refuse();
  return Response.json({ backups: await listBackups() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const admin = await can("backups");
  if (!admin) return refuse();
  try {
    const saved = await saveBackup();
    await logAction(admin, "Made a backup");
    return Response.json({ saved, backups: await listBackups() });
  } catch (err) {
    console.error("Backup failed:", err);
    return Response.json({ error: err.message || "Backup failed. Please try again." }, { status: 500 });
  }
}

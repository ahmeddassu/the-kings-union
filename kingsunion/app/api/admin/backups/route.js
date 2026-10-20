// Admin: GET lists stored backups; POST makes one now.
import { isAdmin } from "@/lib/admin_auth";
import { listBackups, saveBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const denied = () => Response.json({ error: "Please sign in again." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return denied();
  return Response.json({ backups: await listBackups() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  if (!(await isAdmin())) return denied();
  try {
    const saved = await saveBackup();
    return Response.json({ saved, backups: await listBackups() });
  } catch (err) {
    console.error("Backup failed:", err);
    return Response.json({ error: err.message || "Backup failed. Please try again." }, { status: 500 });
  }
}

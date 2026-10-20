// Admin: download a stored backup (?name=...) or a fresh copy right now (no name).
import { isAdmin } from "@/lib/admin_auth";
import { readBackup, snapshot, pack, backupName } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  if (!(await isAdmin())) return new Response("Please sign in again.", { status: 401 });
  const name = new URL(request.url).searchParams.get("name");
  let body;
  let filename = name;
  if (name) {
    body = await readBackup(name);
    if (!body) return new Response("Backup not found.", { status: 404 });
  } else {
    body = pack(await snapshot());
    filename = backupName();
  }
  return new Response(body, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

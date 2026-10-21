// Admin: put a backup back. Takes an uploaded backup file, or the name of a
// stored one. Makes a safety backup of the current data first when storage is
// set up, so a restore can itself be undone.
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { readBackup, unpack, restore, saveBackup, blobConfigured } from "@/lib/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  const admin = await can("backups");
  if (!admin) return refuse();
  const form = await request.formData().catch(() => null);
  if (!form || form.get("confirm") !== "RESTORE") return Response.json({ error: "Type RESTORE to confirm." }, { status: 400 });
  try {
    let buffer;
    const file = form.get("file");
    const name = form.get("name");
    if (file && typeof file === "object" && file.size) {
      if (file.size > 4 * 1024 * 1024) throw new Error("That file is too big to be a backup.");
      buffer = Buffer.from(await file.arrayBuffer());
    } else if (name) {
      buffer = await readBackup(String(name));
      if (!buffer) throw new Error("Backup not found.");
    } else throw new Error("Choose a backup to restore.");
    const data = unpack(buffer);
    const safety = blobConfigured() ? await saveBackup() : null;
    const restored = await restore(data);
    await logAction(admin, `Restored a backup from ${data.createdAt}`);
    return Response.json({ ok: true, restored, from: data.createdAt, safety: safety?.name || null });
  } catch (err) {
    console.error("Restore failed:", err);
    return Response.json({ error: err.message || "Restore failed." }, { status: 400 });
  }
}

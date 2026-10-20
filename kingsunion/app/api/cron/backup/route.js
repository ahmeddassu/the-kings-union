// Nightly backup, run by Vercel Cron (see vercel.json and lib/backup.js).
// If CRON_SECRET is set in Vercel, only Vercel's scheduler can run it;
// otherwise it runs at most once every 12 hours, whoever calls it.
import { saveBackup, listBackups, blobConfigured } from "@/lib/backup";
import { storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Not allowed", { status: 401 });
  if (!storeConfigured || !blobConfigured()) return Response.json({ skipped: "Backup storage isn’t set up." });
  try {
    if (!secret) {
      const [latest] = await listBackups();
      if (latest && Date.now() - latest.uploadedAt < 12 * 3600 * 1000) return Response.json({ skipped: "Backed up recently." });
    }
    const saved = await saveBackup();
    return Response.json({ ok: true, ...saved });
  } catch (err) {
    console.error("Nightly backup failed:", err);
    return Response.json({ error: "Backup failed." }, { status: 500 });
  }
}

// Events / Executive: save a speaker's title, link and hidden setting.
import { can, refuse } from "@/lib/admin_auth";
import { updateProfile, isSpeakerSlug } from "@/lib/speaker_profiles";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const admin = await can("guests");
  if (!admin) return refuse();
  const { slug } = await params;
  if (!isSpeakerSlug(slug)) return Response.json({ error: "That speaker wasn’t found." }, { status: 404 });
  try {
    const body = await request.json().catch(() => ({}));
    const profile = await updateProfile(slug, body);
    await logAction(admin, `Updated the speaker profile for ${String(body.name || slug).slice(0, 80)}`);
    return Response.json({ profile });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

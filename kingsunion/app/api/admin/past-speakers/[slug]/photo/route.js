// Events / Executive: upload (POST, the image as the request body) or remove (DELETE) a speaker's photo.
import { can, refuse } from "@/lib/admin_auth";
import { setPhoto, removePhoto, isSpeakerSlug } from "@/lib/speaker_profiles";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
const missing = () => Response.json({ error: "That speaker wasn’t found." }, { status: 404 });

export async function POST(request, { params }) {
  const admin = await can("guests");
  if (!admin) return refuse();
  const { slug } = await params;
  if (!isSpeakerSlug(slug)) return missing();
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 350 * 1024) return Response.json({ error: "That photo is too big. Try a smaller image." }, { status: 400 });
  try {
    const photo = await setPhoto(slug, await request.arrayBuffer());
    await logAction(admin, `Uploaded a speaker photo (${slug})`);
    return Response.json({ photo });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("guests");
  if (!admin) return refuse();
  const { slug } = await params;
  if (!isSpeakerSlug(slug)) return missing();
  await removePhoto(slug);
  await logAction(admin, `Removed a speaker photo (${slug})`);
  return Response.json({ photo: "" });
}

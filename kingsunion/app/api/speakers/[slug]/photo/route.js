// A speaker's photo, as uploaded in admin → Past speakers. The address changes
// whenever the photo does, so browsers can keep it for a long time.
import { getPhoto } from "@/lib/speaker_profiles";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const photo = await getPhoto(slug).catch(() => null);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(photo.body, {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

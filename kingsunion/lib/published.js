// Results the admins have published from live voting (see lib/voting.js).
// Read with a 60-second cache, and never breaks the website: any problem just
// means no published results.
import { cachedGet } from "@/lib/store";

export async function getPublishedResults() {
  const raw = await cachedGet("ku:published", 60);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list)
      ? list.filter((r) => r && r.title && Number.isFinite(r.proposition) && Number.isFinite(r.opposition))
      : [];
  } catch {
    return [];
  }
}

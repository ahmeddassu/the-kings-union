// Admin: download a debate's QR code. ?format=png (default) or svg
import QRCode from "qrcode";
import { isAdmin } from "@/lib/admin_auth";
import { getDebate, votingLink } from "@/lib/voting";
import { QR_COLOURS } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  if (!(await isAdmin())) return new Response("Please sign in again.", { status: 401 });
  const { id } = await params;
  const debate = await getDebate(id);
  if (!debate) return new Response("Not found", { status: 404 });

  const link = votingLink(debate.code);
  const filename = `kings-union-vote-${debate.code}`;
  const svg = new URL(request.url).searchParams.get("format") === "svg";
  const options = { errorCorrectionLevel: "M", margin: 2, color: QR_COLOURS };

  if (svg) {
    const body = await QRCode.toString(link, { ...options, type: "svg" });
    return new Response(body, {
      headers: { "Content-Type": "image/svg+xml", "Content-Disposition": `attachment; filename="${filename}.svg"` },
    });
  }
  const body = await QRCode.toBuffer(link, { ...options, type: "png", width: 1200 });
  return new Response(body, {
    headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="${filename}.png"` },
  });
}

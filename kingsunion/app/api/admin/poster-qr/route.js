// Admin: download a QR code for a website page. ?page=welcome&format=png|svg
import QRCode from "qrcode";
import { isAdmin } from "@/lib/admin_auth";
import { QR_COLOURS } from "@/lib/qr";
import { posterPages, posterUrl } from "@/lib/posters";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await isAdmin())) return new Response("Please sign in again.", { status: 401 });
  const params = new URL(request.url).searchParams;
  const page = posterPages.find((p) => p.key === params.get("page"));
  if (!page) return new Response("Not found", { status: 404 });

  const link = posterUrl(page);
  const filename = `kings-union-${page.key}-qr`;
  const options = { errorCorrectionLevel: "M", margin: 2, color: QR_COLOURS };

  if (params.get("format") === "svg") {
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

import QRCode from "qrcode";
import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { QR_COLOURS } from "@/lib/qr";
import { posterPages, posterUrl } from "@/lib/posters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Poster QR codes · Admin" };

const btn =
  "inline-flex min-h-11 flex-1 items-center justify-center border border-[#d4af37] px-3 text-sm font-bold hover:bg-white/10";

export default async function PostersPage() {
  const base = await requireAdmin();
  const codes = await Promise.all(
    posterPages.map(async (p) => ({
      ...p,
      url: posterUrl(p),
      svg: await QRCode.toString(posterUrl(p), { type: "svg", errorCorrectionLevel: "M", margin: 0, color: QR_COLOURS }),
    }))
  );

  return (
    <AdminShell base={base} current="/posters">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">For posters and flyers</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Poster QR codes</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Download a QR code for a page of the website. Use PNG for Canva or Instagram, SVG for print. For freshers’
        posters, use Welcome.
      </p>
      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.map((c) => (
          <li key={c.key} className="flex flex-col">
            <div className="bg-white p-6">
              <div className="mx-auto w-full max-w-[220px] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: c.svg }} />
            </div>
            <p className="mt-3 text-lg font-bold">{c.label}</p>
            <p className="text-sm text-white/60 break-all">{c.url}</p>
            <div className="mt-3 flex gap-2">
              <a href={`/api/admin/poster-qr?page=${c.key}&format=png`} className={btn}>
                PNG
              </a>
              <a href={`/api/admin/poster-qr?page=${c.key}&format=svg`} className={btn}>
                SVG
              </a>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}

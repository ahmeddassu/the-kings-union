// Lets admin be added to a phone's home screen as an app (needed on iPhone for
// notifications). On admin.kingsunion.org.uk it starts at "/", elsewhere at "/admin".
export const dynamic = "force-dynamic";

export async function GET(request) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const base = host.startsWith("admin.") ? "" : "/admin";
  const manifest = {
    name: "King’s Union Admin",
    short_name: "KU Admin",
    start_url: `${base}/dashboard`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#3d0202",
    theme_color: "#3d0202",
    icons: [
      { src: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/admin-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/admin-icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } });
}

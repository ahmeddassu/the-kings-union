// Pages worth putting on posters and flyers as QR codes (admin → Poster QR codes).
import { siteUrl } from "@/lib/site";

export const posterPages = [
  { key: "welcome", label: "Welcome (for freshers)", path: "/welcome" },
  { key: "motions", label: "Suggest a motion", path: "/motions" },
  { key: "apply", label: "Apply to speak", path: "/speak/apply" },
  { key: "involved", label: "Get involved", path: "/get-involved" },
  { key: "home", label: "Homepage", path: "/" },
];

// The QR link carries a tag (utm_*) so scans show up in Visitor stats under
// "QR codes and posters". The tag holds no personal information.
export const posterUrl = (page) => {
  const url = new URL(page.path, siteUrl);
  url.search = new URLSearchParams({ utm_source: "poster", utm_medium: "qr", utm_campaign: page.key }).toString();
  return url.toString();
};

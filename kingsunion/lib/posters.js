// Pages worth putting on posters and flyers as QR codes (admin → Poster QR codes).
import { siteUrl } from "@/lib/site";

export const posterPages = [
  { key: "welcome", label: "Welcome (for freshers)", path: "/welcome" },
  { key: "motions", label: "Suggest a motion", path: "/motions" },
  { key: "apply", label: "Apply to speak", path: "/speak/apply" },
  { key: "involved", label: "Get involved", path: "/get-involved" },
  { key: "home", label: "Homepage", path: "/" },
];

export const posterUrl = (page) => new URL(page.path, siteUrl).toString().replace(/\/$/, "");

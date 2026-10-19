// Draws the link-preview card for an event (what shows up when a debate's link is
// shared on WhatsApp, iMessage, Instagram, X, LinkedIn...).
// Fonts in assets/og are EB Garamond and Playfair Display (SIL Open Font Licence).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { longDate } from "@/lib/events";
import { ticketStatus } from "@/lib/tickets";

export const shareImageSize = { width: 1200, height: 630 };

const GOLD = "#d4af37";
const MAROON = "#3d0202";

const asset = (...p) => readFile(join(process.cwd(), ...p));

async function dataUrl(publicPath, type) {
  if (!publicPath || !publicPath.startsWith("/")) return null;
  try {
    const buf = await asset("public", publicPath);
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function todayInLondon() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// Smaller type for longer motions, so they always fit.
function titleSize(text) {
  const n = text.length;
  if (n <= 40) return 76;
  if (n <= 60) return 66;
  if (n <= 85) return 56;
  if (n <= 115) return 48;
  return 40;
}

export async function shareImage(event) {
  const [playfair, garamond, garamondBold, crest] = await Promise.all([
    asset("assets/og/playfair-display-latin-700-normal.woff"),
    asset("assets/og/eb-garamond-latin-400-normal.woff"),
    asset("assets/og/eb-garamond-latin-700-normal.woff"),
    asset("assets/og/crest.png"),
  ]);

  const crestUrl = `data:image/png;base64,${crest.toString("base64")}`;
  const background = await dataUrl(event?.background || "", "image/jpeg");
  const fonts = [
    { name: "Playfair", data: playfair, weight: 700, style: "normal" },
    { name: "Garamond", data: garamond, weight: 400, style: "normal" },
    { name: "Garamond", data: garamondBold, weight: 700, style: "normal" },
  ];

  if (!event) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: MAROON }}>
        <img src={crestUrl} height={300} />
      </div>,
      { ...shareImageSize, fonts }
    );
  }

  const today = todayInLondon();
  const upcoming = event.date >= today;
  const isDebate = event.type === "Debate";
  const title = isDebate ? `“${event.title}”` : event.title;

  let footer = null;
  if (upcoming && event.tickets) {
    const status = await ticketStatus(event);
    const label = status?.key === "soldout" ? "Join the waitlist" : "Get tickets";
    footer = (
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", background: GOLD, color: MAROON, fontFamily: "Garamond", fontWeight: 700, fontSize: 34, padding: "14px 34px" }}>
          {label}
        </div>
        {status && (
          <div style={{ display: "flex", color: GOLD, fontFamily: "Garamond", fontWeight: 700, fontSize: 26, letterSpacing: 4, textTransform: "uppercase" }}>
            {status.label}
          </div>
        )}
      </div>
    );
  } else if (!upcoming && event.result) {
    const { proposition: p, opposition: o } = event.result;
    const verdict = p > o ? "Motion carried" : p < o ? "Motion defeated" : "Motion tied";
    footer = (
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "Garamond", fontSize: 32 }}>
        <div style={{ display: "flex", color: GOLD, fontWeight: 700 }}>{verdict}</div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.75)" }}>
          Ayes {p} · Noes {o}
        </div>
      </div>
    );
  }

  const when = [longDate(event.date), event.time, event.venue].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: MAROON, color: "white" }}>
        {background && (
          <img
            src={background}
            style={{ position: "absolute", top: 0, right: 0, width: 760, height: 630, objectFit: "cover", opacity: 0.35 }}
          />
        )}
        {/* Fade the picture into the maroon so the text stays readable */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex",
            backgroundImage: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON} 38%, rgba(61,2,2,0.75) 65%, rgba(61,2,2,0.35) 100%)`,
          }}
        />
        <div style={{ position: "absolute", top: 28, left: 28, right: 28, bottom: 28, display: "flex", border: `2px solid ${GOLD}` }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "64px 76px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={crestUrl} height={64} />
            <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: GOLD }}>
              The King’s Union · {upcoming ? (isDebate ? "Debate" : event.type) : `${event.type}, ${event.date.slice(0, 4)}`}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1000 }}>
            <div style={{ display: "flex", fontFamily: "Playfair", fontWeight: 700, fontSize: titleSize(title), lineHeight: 1.08 }}>
              {title}
            </div>
            <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
              {when}
            </div>
          </div>

          <div style={{ display: "flex", minHeight: 66, alignItems: "center" }}>
            {footer || (
              <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 28, color: "rgba(255,255,255,0.6)" }}>
                kingsunion.org.uk
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...shareImageSize, fonts }
  );
}

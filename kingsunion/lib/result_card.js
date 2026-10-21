// Result cards: a ready-to-post image of a debate's result, for Instagram
// (Story 1080×1920, or feed post 1080×1350), in the site's colours and fonts.
// Downloaded from admin → Result cards, or the debate's own page.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { displayDate } from "@/lib/debates";

const GOLD = "#d4af37";
const MAROON = "#3d0202";
const WHITE = "#ffffff";

export const CARD_SIZES = {
  story: { width: 1080, height: 1920, label: "Instagram Story" },
  post: { width: 1080, height: 1350, label: "Instagram post" },
};

const asset = (...p) => readFile(join(process.cwd(), ...p));

// Smaller type for longer motions, so they always fit.
function titleSize(text, story) {
  const n = text.length;
  const steps = story ? [[40, 92], [60, 80], [85, 68], [115, 58], [999, 50]] : [[40, 78], [60, 68], [85, 58], [115, 50], [999, 44]];
  return steps.find(([max]) => n <= max)[1];
}

export function verdictOf(counts) {
  // A tie means the motion falls, as the House has always recorded it.
  return counts.aye > counts.no ? "Motion carried" : "Motion defeated";
}

export async function resultCard(debate, counts, format = "story") {
  const size = CARD_SIZES[format] || CARD_SIZES.story;
  const story = format !== "post";
  const [playfair, playfairItalic, garamond, garamondBold, crest] = await Promise.all([
    asset("assets/og/playfair-display-latin-700-normal.woff"),
    asset("assets/og/playfair-display-latin-700-italic.woff"),
    asset("assets/og/eb-garamond-latin-400-normal.woff"),
    asset("assets/og/eb-garamond-latin-700-normal.woff"),
    asset("assets/og/crest.png"),
  ]);
  const crestUrl = `data:image/png;base64,${crest.toString("base64")}`;
  const fonts = [
    { name: "Playfair", data: playfair, weight: 700, style: "normal" },
    { name: "Playfair", data: playfairItalic, weight: 700, style: "italic" },
    { name: "Garamond", data: garamond, weight: 400, style: "normal" },
    { name: "Garamond", data: garamondBold, weight: 700, style: "normal" },
  ];

  const total = counts.aye + counts.no;
  const ayePct = total ? Math.round((counts.aye / total) * 100) : 0;
  const noPct = total ? 100 - ayePct : 0;
  const carried = counts.aye > counts.no;
  const title = `“${debate.title}”`;
  const num = (n) => n.toLocaleString("en-GB");
  const when = [debate.date ? displayDate(debate.date) : "", debate.venue].filter(Boolean).join(" · ");
  const s = story ? 1 : 0.86; // overall scale for the shorter post

  const eyebrow = { fontFamily: "Garamond", fontWeight: 700, fontSize: 30 * s, letterSpacing: 7, color: GOLD, textTransform: "uppercase" };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: `radial-gradient(circle at 50% 38%, #5a0b0b 0%, ${MAROON} 62%, #2a0101 100%)`,
        padding: story ? "120px 90px 110px" : "70px 80px 70px",
        color: WHITE,
        position: "relative",
      }}
    >
      {/* faint crest behind everything */}
      <img src={crestUrl} width={story ? 900 : 760} style={{ position: "absolute", top: story ? 520 : 300, left: story ? 90 : 160, opacity: 0.05 }} />

      {/* masthead */}
      <img src={crestUrl} height={story ? 190 : 130} />
      <div style={{ display: "flex", marginTop: story ? 28 : 18, fontFamily: "Playfair", fontWeight: 700, fontSize: story ? 54 : 44 }}>
        <span style={{ fontStyle: "italic", marginRight: 14 }}>the</span>
        <span>King’s Union</span>
      </div>
      <div style={{ display: "flex", width: 80, height: 3, background: GOLD, marginTop: story ? 34 : 22 }} />

      {/* the motion */}
      <div style={{ display: "flex", ...eyebrow, marginTop: story ? 80 : 40 }}>The House has voted</div>
      <div
        style={{
          display: "flex",
          marginTop: story ? 36 : 22,
          fontFamily: "Playfair",
          fontWeight: 700,
          fontSize: titleSize(title, story),
          lineHeight: 1.08,
          textAlign: "center",
          justifyContent: "center",
          letterSpacing: -1,
        }}
      >
        {title}
      </div>

      {/* the result */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", ...eyebrow }}>Ayes</div>
            <div style={{ display: "flex", fontFamily: "Playfair", fontWeight: 700, fontSize: 168 * s, lineHeight: 1, color: GOLD }}>{num(counts.aye)}</div>
            <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 36 * s, color: "rgba(255,255,255,0.75)" }}>{ayePct}%</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", ...eyebrow, color: "rgba(255,255,255,0.85)" }}>Noes</div>
            <div style={{ display: "flex", fontFamily: "Playfair", fontWeight: 700, fontSize: 168 * s, lineHeight: 1 }}>{num(counts.no)}</div>
            <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 36 * s, color: "rgba(255,255,255,0.75)" }}>{noPct}%</div>
          </div>
        </div>
        <div style={{ display: "flex", width: "100%", height: story ? 30 : 24, marginTop: 26, border: `2px solid ${GOLD}` }}>
          <div style={{ display: "flex", width: `${ayePct}%`, background: GOLD }} />
          <div style={{ display: "flex", width: `${noPct}%`, background: "rgba(255,255,255,0.85)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontFamily: "Garamond", fontSize: 30 * s, color: "rgba(255,255,255,0.7)" }}>
          <span>{num(total)} votes cast</span>
          <span style={{ fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: carried ? GOLD : WHITE }}>{verdictOf(counts)}</span>
        </div>
      </div>

      {/* footer */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: story ? 110 : 48 }}>
        {when && <div style={{ display: "flex", fontFamily: "Garamond", fontSize: 34 * s, color: "rgba(255,255,255,0.75)" }}>{when}</div>}
        <div style={{ display: "flex", marginTop: 14, fontFamily: "Garamond", fontWeight: 700, fontSize: 34 * s, letterSpacing: 3, color: GOLD }}>kingsunion.org.uk</div>
      </div>
    </div>,
    { width: size.width, height: size.height, fonts }
  );
}

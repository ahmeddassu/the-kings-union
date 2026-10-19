// QR codes for voting: King's Union red on white.
import QRCode from "qrcode";
import { votingLink } from "@/lib/voting";

export const QR_COLOURS = { dark: "#720000", light: "#ffffff" }; // the crest red

export async function qrSvg(code) {
  return QRCode.toString(votingLink(code), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: QR_COLOURS,
  });
}

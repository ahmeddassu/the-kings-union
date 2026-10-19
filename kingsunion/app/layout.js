import { EB_Garamond, Playfair_Display, Playfair_Display_SC } from "next/font/google";
import "./globals.css";
import { siteMetadata } from "@/lib/site";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const playfairSC = Playfair_Display_SC({
  variable: "--font-playfair-sc",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata = siteMetadata;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${playfair.variable} ${playfairSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

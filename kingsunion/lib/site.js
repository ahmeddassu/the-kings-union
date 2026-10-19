// Link previews (WhatsApp, iMessage, Instagram, Slack, X, LinkedIn...).
// The site's address. Set SITE_URL in Vercel to override it.

export const siteName = "The King’s Union";

export const siteDescription =
  "The debating society at King’s College London. Debates on the questions of the day, with student and visiting speakers.";

export const siteUrl = new URL(process.env.SITE_URL || "https://www.kingsunion.org.uk");

export const defaultImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "A King’s Union debate in the College Chapel",
};

export const siteMetadata = {
  metadataBase: siteUrl,
  title: siteName,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [defaultImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [defaultImage.url],
  },
};

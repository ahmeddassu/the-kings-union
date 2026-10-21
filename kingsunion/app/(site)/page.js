import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import JoinBand from "@/components/join_band";
import NextDebate from "@/components/next_debate";
import Stats from "@/components/stats";
import TheHouse from "@/components/the_house";
import TheFloor from "@/components/the_floor";
import Ticker from "@/components/ticker";
import WhoWeAre from "@/components/who";
import PastDebates from "@/components/past_debates";
import FollowUs from "@/components/follow";
import Footer from "@/components/footer";
import MailingList from "@/components/mailing_list";
import PartnerStrip from "@/components/partner_strip";
import SubscribeCalendar from "@/components/subscribe_calendar";
import Faq from "@/components/faq";
import { siteName, siteDescription, siteUrl } from "@/lib/site";
import { socialLinks } from "@/lib/nav";

// Tells Google the site's name and logo for search results (the name shown
// above results, and the logo in the knowledge panel).
// Check with https://search.google.com/test/rich-results after changing.
const orgId = new URL("/#organization", siteUrl).toString();
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": new URL("/#website", siteUrl).toString(),
    name: siteName,
    alternateName: ["King’s Union", "The King’s Union Society", "KCL Union Society"],
    url: siteUrl.toString(),
    inLanguage: "en-GB",
    publisher: { "@id": orgId },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    alternateName: ["King’s Union", "The King’s Union Society"],
    url: siteUrl.toString(),
    logo: {
      "@type": "ImageObject",
      url: new URL("/KUArmsFinal.png", siteUrl).toString(),
    },
    image: new URL("/og.jpg", siteUrl).toString(),
    description: siteDescription,
    email: "operations@kingsunion.org.uk",
    contactPoint: [
      { "@type": "ContactPoint", contactType: "customer support", email: "operations@kingsunion.org.uk", availableLanguage: "English" },
      { "@type": "ContactPoint", contactType: "sponsorship", email: "sponsorships@kingsunion.org.uk", availableLanguage: "English" },
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "King’s College London Students’ Union",
      url: "https://www.kclsu.org/",
    },
    sameAs: [...socialLinks.map((s) => s.href), "https://www.linkedin.com/company/109812004/"],
  },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Navbar/>
      <main className="bg-[#140000]">
      <Hero/>
      <NextDebate overlap/>
      <Ticker/>
      <Stats/>
      <WhoWeAre/>
      <PastDebates/>
      <TheFloor/>
      <TheHouse/>
      <JoinBand/>
      <SubscribeCalendar/>
      <PartnerStrip/>
      <Faq/>
      <FollowUs/>
      <MailingList/>
      </main>
      <Footer/>
    </>
  );
}

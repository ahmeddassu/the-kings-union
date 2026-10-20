import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import JoinBand from "@/components/join_band";
import NextDebate from "@/components/next_debate";
import Stats from "@/components/stats";
import Speakers from "@/components/speakers";
import WhoWeAre from "@/components/who";
import PastDebates from "@/components/past_debates";
import FollowUs from "@/components/follow";
import Footer from "@/components/footer";
import Gallery from "@/components/gallery";
import MailingList from "@/components/mailing_list";
import PartnerStrip from "@/components/partner_strip";
import SubscribeCalendar from "@/components/subscribe_calendar";
import Faq from "@/components/faq";
import { chamberGallery } from "@/lib/gallery";
import { siteName, siteDescription, siteUrl } from "@/lib/site";
import { socialLinks } from "@/lib/nav";

// Tells Google the site's name and logo for search results.
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: ["King’s Union", "The King’s Union Society", "KCL Union Society"],
    url: siteUrl.toString(),
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl.toString(),
    logo: new URL("/KUArmsFinal.png", siteUrl).toString(),
    description: siteDescription,
    email: "operations@kingsunion.org.uk",
    sameAs: [...socialLinks.map((s) => s.href), "https://www.linkedin.com/company/109812004/"],
  },
];

export default function Home() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar/>
      <Hero/>
      <NextDebate/>
      <JoinBand/>
      <Stats/>
      <WhoWeAre/>
      <PastDebates/>
      <SubscribeCalendar/>
      <Speakers/>
      <PartnerStrip/>
      <Gallery eyebrow="Gallery" title="From the chamber" photos={chamberGallery}/>
      <Faq/>
      <FollowUs/>
      <MailingList/>
      <Footer/> 
    </div>
  );
}

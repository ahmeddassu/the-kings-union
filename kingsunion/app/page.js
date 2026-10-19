import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import JoinBand from "@/components/join_band";
import NextDebate from "@/components/next_debate";
import Stats from "@/components/stats";
import Speakers from "@/components/speakers";
import WhoWeAre from "@/components/who";
import PastDebates from "@/components/past_debates";
import MeetTheCommittee from "@/components/meet_committee";
import FollowUs from "@/components/follow";
import Footer from "@/components/footer";
import Gallery from "@/components/gallery";
import MailingList from "@/components/mailing_list";
import PartnerStrip from "@/components/partner_strip";
import SubscribeCalendar from "@/components/subscribe_calendar";
import Faq from "@/components/faq";
import { chamberGallery } from "@/lib/gallery";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <NextDebate/>
      <JoinBand/>
      <WhoWeAre/>
      <Stats/>
      <PastDebates/>
      <SubscribeCalendar/>
      <MailingList/>
      <Speakers/>
      <PartnerStrip/>
      <Gallery eyebrow="Gallery" title="From the chamber" photos={chamberGallery}/>
      <MeetTheCommittee/>
      <Faq/>
      <FollowUs/>
      <Footer/> 
    </div>
  );
}

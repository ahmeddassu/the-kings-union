'use client'
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import WhoWeAre from "@/components/who";
import PastDebates from "@/components/past_debates";
import MeetTheCommittee from "@/components/meet_committee";
import FollowUs from "@/components/follow";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <WhoWeAre/>
      <PastDebates/>
      <MeetTheCommittee/>
      <FollowUs/>
      <Footer/> 
    </div>
  );
}

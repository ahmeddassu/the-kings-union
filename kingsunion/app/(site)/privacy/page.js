import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import StatsOptOut from "@/components/stats_opt_out";
import { UNION_EMAIL } from "@/lib/contact";

export const metadata = {
  title: "Privacy",
  description: "What the King’s Union website collects, why, how long it is kept, and how to opt out.",
};

const h2 = "title mt-14 text-2xl sm:text-3xl font-bold tracking-tight";
const p = "mt-4 text-base sm:text-lg leading-relaxed text-white/85";
const li = "text-base sm:text-lg leading-relaxed text-white/85";
const link = "text-[#d4af37] hover:text-white underline underline-offset-4 [overflow-wrap:anywhere]";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif">
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Privacy</p>
            <h1 className="title text-4xl sm:text-6xl font-bold leading-[1.05]">Your privacy</h1>
            <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/80">
              What this website collects, why, and how to stop it. In short: no advertising, no tracking cookies, and
              nothing sold or shared.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h2 className="title text-2xl sm:text-3xl font-bold tracking-tight">Who we are</h2>
            <p className={p}>
              This website is run by the King’s Union, the debating society at King’s College London. For anything about
              your information, email <a className={link} href={`mailto:${UNION_EMAIL}`}>{UNION_EMAIL}</a>.
            </p>

            <h2 id="stats" className={h2}>Visitor statistics</h2>
            <p className={p}>
              To see which pages people find useful and how they find us, the site counts visits on our own system. We
              don’t use Google Analytics or any advertising or tracking service, and we don’t put cookies on your device
              for this.
            </p>
            <p className={p}>When you view a page, we count:</p>
            <ul className="mt-3 list-disc pl-6 space-y-1.5">
              <li className={li}>the page, and roughly how long it was on screen and how far down it was read;</li>
              <li className={li}>the website that linked you here (just its name, like instagram.com), or the poster or campaign link you used;</li>
              <li className={li}>your type of device, browser, operating system and screen size (for example “phone, Safari, iOS”);</li>
              <li className={li}>your country and city, worked out from your internet address, and your browser’s language;</li>
              <li className={li}>clicks on buttons that leave the page, such as ticket links and “Add to calendar”.</li>
            </ul>
            <p className={p}>
              These are only stored as totals, such as “40 views of the Term Card today”. Your internet address is never
              stored. To count each visitor once per day, it is combined with your browser type and a random value that
              changes every day, then scrambled one way. The random value is deleted after two days, so the result can’t
              be traced back to you or used to follow you from one day to the next. So that we can tell how long a visit
              lasts, that scrambled code is kept with a page count for 30 minutes after your last page, then turned into
              totals and deleted. Cities with fewer than three visitors are never shown.
            </p>
            <p className={p}>
              Totals are kept for 13 months, are only seen by the committee, and are never shared or sold. We rely on our
              legitimate interest in running and improving the website, and on the UK rules that allow simple statistics
              like these without a cookie banner as long as you’re told and can say no.
            </p>
            <p className={p}>
              Your visits are not counted at all if your browser sends “Do Not Track” or “Global Privacy Control”, or if
              you switch it off here:
            </p>
            <StatsOptOut />

            <h2 className={h2}>Forms</h2>
            <p className={p}>
              When you use a form (contact, Kingsway writer applications, motion suggestions, applying to speak, or ticket
              alerts), we keep what you send so the committee can reply or act on it. It is used only for that purpose,
              and deleted once it is no longer needed. Ticket alerts are sent only because you asked for them, and every
              alert has a link to unsubscribe in one click.
            </p>
            <p className={p}>
              To make sure nothing is lost if something goes wrong, the website’s database (including form submissions) is
              backed up every night to private storage that only the committee can access. Backups are deleted after about
              a month.
            </p>

            <h2 className={h2}>Feedback and Friends of the Union</h2>
            <p className={p}>
              Debate feedback is anonymous: we don’t ask for your name or email, and we don’t record who sent it. If
              you join the Friends of the Union, we keep your name, email, your connection to King’s and what you’re
              interested in, so we can keep in touch. We rely on your consent, which you can withdraw at any time by
              emailing us, and we’ll remove you from the list. Your details are only seen by the committee and are
              never shared or sold.
            </p>

            <h2 className={h2}>Coming to our events</h2>
            <p className={p}>
              Tickets for our events are booked through Luma, which has its own privacy policy. After an event, the
              committee keeps a record of who was checked in at the door: just your name and email address, and which
              events you came to. We use it to see how many people come, and to recognise regulars, for example by
              giving them priority when tickets are in demand. We rely on our legitimate interest in running the
              society. The record is only seen by the committee, is never shared or sold, and is deleted after two
              years. Only totals (how many people came) are ever published.
            </p>

            <h2 className={h2}>Cookies and settings saved in your browser</h2>
            <ul className="mt-4 list-disc pl-6 space-y-1.5">
              <li className={li}>
                <strong>Voting</strong>: when you vote in a debate, a random code is saved so you can only vote once. It
                contains nothing about you.
              </li>
              <li className={li}>
                <strong>Motion upvotes</strong>: when you upvote a suggested motion, a random code is saved so each person
                counts once.
              </li>
              <li className={li}>
                <strong>Term Card view</strong>: if you switch between calendar and list, the site remembers your choice
                in your browser.
              </li>
              <li className={li}>
                <strong>Statistics opt-out</strong>: if you choose “Don’t count my visits”, that choice is saved in your
                browser.
              </li>
            </ul>
            <p className={p}>These are only set when you use the feature, and are needed for it to work.</p>

            <h2 className={h2}>Who else handles it</h2>
            <p className={p}>
              The website is hosted by Vercel and its information is held in a database provider connected through
              Vercel. They process it only to run the site for us. Some of this may be handled outside the UK under
              approved safeguards.
            </p>

            <h2 className={h2}>Your rights</h2>
            <p className={p}>
              You can ask to see, correct or delete information you have sent us, or object to how we use it, by emailing{" "}
              <a className={link} href={`mailto:${UNION_EMAIL}`}>{UNION_EMAIL}</a>. Visitor statistics can’t be linked
              to you, so there is nothing about you in them to look up or delete. If you’re unhappy with how we’ve handled
              your information, you can complain to the Information Commissioner’s Office at{" "}
              <a className={link} href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

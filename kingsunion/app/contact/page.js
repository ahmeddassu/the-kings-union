import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact_form";
import KingswayForm from "@/components/kingsway_form";
import { MEDIA_CONTACT, SPONSORSHIP_EMAIL, UNION_EMAIL } from "@/lib/contact";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#3d0202] text-white font-serif">

        {/* Hero */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">

            <p className="text-xs sm:text-sm uppercase tracking-widest mb-6 text-[#d4af37]">
              Contact
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-5xl">
              Get in
              <br />
              touch.
            </h1>

            <p className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85">
              Whether you have a question about the Union, want to speak at a
              debate, or want to write for <em>Kingsway</em>, we’d be happy to hear
              from you. Pick the right form below and we’ll get back to you.
            </p>

          </div>
        </section>

        {/* Two forms: the Union, and Kingsway */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            <ContactForm
              id="union"
              team="union"
              eyebrow="The King’s Union"
              title="Debates, speaking, membership and anything else."
              note="Goes to the Union committee."
            />
            <KingswayForm id="kingsway" />
          </div>
        </section>

        {/* Other enquiries: press and sponsorship */}
        <section id="media" className="scroll-mt-24 border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            <div className="md:col-span-4">
              <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Other enquiries</p>
              <h2 className="title text-3xl sm:text-4xl font-bold tracking-tight leading-tight">Press and sponsorship.</h2>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-t border-[#d4af37] pt-4">
                <h3 className="text-xl font-bold">Media contact</h3>
                {MEDIA_CONTACT.email ? (
                  <>
                    {MEDIA_CONTACT.name && <p className="mt-2 text-base text-white/80">{MEDIA_CONTACT.name}</p>}
                    <a href={`mailto:${MEDIA_CONTACT.email}`} className="mt-1 inline-flex items-center min-h-11 text-base font-bold text-[#d4af37] hover:text-white underline underline-offset-4 break-all">
                      {MEDIA_CONTACT.email}
                    </a>
                  </>
                ) : (
                  <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                    Details coming soon. In the meantime, journalists can reach us at{" "}
                    <a href={`mailto:${UNION_EMAIL}`} className="text-[#d4af37] hover:text-white underline underline-offset-4 [overflow-wrap:anywhere]">{UNION_EMAIL}</a>.
                  </p>
                )}
                <a href="/press" className="mt-2 inline-flex items-center min-h-11 text-sm sm:text-base font-bold text-[#d4af37] hover:text-white transition-colors">
                  Press page and images →
                </a>
              </div>
              <div className="border-t border-[#d4af37] pt-4">
                <h3 className="text-xl font-bold">Sponsorship</h3>
                <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                  For partnerships and sponsorship, see{" "}
                  <a href="/support#sponsorship" className="text-[#d4af37] hover:text-white underline underline-offset-4">what we offer</a>{" "}
                  or email us.
                </p>
                <a href={`mailto:${SPONSORSHIP_EMAIL}`} className="mt-1 inline-flex items-center min-h-11 text-base font-bold text-[#d4af37] hover:text-white underline underline-offset-4 break-all">
                  {SPONSORSHIP_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
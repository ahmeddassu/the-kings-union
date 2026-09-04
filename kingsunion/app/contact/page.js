import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
              debate, or simply want to get involved, we'd be happy to hear
              from you.
            </p>

          </div>
        </section>

        {/* Contact form */}
        <section className="border-b border-[#d4af37]">
          <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">
                  Send a message
                </p>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  What can we
                  <br />
                  help with?
                </h2>

                <p className="mt-6 max-w-md text-sm sm:text-base text-white/70 leading-relaxed">
                  Fill out the form and a member of the committee will get back
                  to you.
                </p>
              </div>

              <form className="space-y-6">

                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs uppercase tracking-widest mb-2 text-[#d4af37]"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full border-b border-[#d4af37] bg-transparent py-3 text-white placeholder:text-white/40 outline-none focus:border-b-2"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-widest mb-2 text-[#d4af37]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full border-b border-[#d4af37] bg-transparent py-3 text-white placeholder:text-white/40 outline-none focus:border-b-2"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs uppercase tracking-widest mb-2 text-[#d4af37]"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="w-full border-b border-[#d4af37] bg-transparent py-3 text-white placeholder:text-white/40 outline-none focus:border-b-2"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs uppercase tracking-widest mb-2 text-[#d4af37]"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full border border-[#d4af37] bg-transparent p-3 text-white placeholder:text-white/40 outline-none resize-none focus:border-2"
                    placeholder="Write your message..."
                  />
                </div>

                <button
                  type="submit"
                  className="border border-[#d4af37] px-7 py-3 text-sm font-bold text-white hover:bg-[#d4af37] hover:text-[#3d0202] transition-colors duration-200"
                >
                  Send message →
                </button>

              </form>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
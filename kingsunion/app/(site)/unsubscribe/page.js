import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { tokenValid } from "@/lib/alert_mail";
import { UNION_EMAIL } from "@/lib/contact";

export const dynamic = "force-dynamic";
export const metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

const btn = "inline-flex min-h-12 items-center bg-[#d4af37] px-6 text-base font-bold text-[#3d0202] hover:bg-white transition-colors duration-200";

// Asks before unsubscribing, so email security scanners that open links
// don't unsubscribe people by accident.
export default async function UnsubscribePage({ searchParams }) {
  const q = await searchParams;
  const email = String(q?.e || "").trim().toLowerCase();
  const valid = tokenValid(email, q?.t);

  let body;
  if (q?.done) {
    body = (
      <>
        <h1 className="title text-4xl sm:text-5xl font-bold">You’re unsubscribed</h1>
        <p className="mt-6 text-lg text-white/80">You won’t get any more ticket alerts from us. You can sign up again any time on the homepage.</p>
        <a href="/term-card" className={`${btn} mt-8`}>See what’s on →</a>
      </>
    );
  } else if (valid) {
    body = (
      <>
        <h1 className="title text-4xl sm:text-5xl font-bold">Unsubscribe from ticket alerts?</h1>
        <p className="mt-6 text-lg text-white/80">
          We’ll stop emailing <strong className="break-all">{email}</strong> about tickets.
        </p>
        <form method="post" action="/api/unsubscribe" className="mt-8">
          <input type="hidden" name="e" value={email} />
          <input type="hidden" name="t" value={q.t} />
          <input type="hidden" name="page" value="1" />
          <button type="submit" className={btn}>Unsubscribe</button>
        </form>
      </>
    );
  } else {
    body = (
      <>
        <h1 className="title text-4xl sm:text-5xl font-bold">That link didn’t work</h1>
        <p className="mt-6 text-lg text-white/80">
          Please use the unsubscribe link in one of our emails, or email{" "}
          <a href={`mailto:${UNION_EMAIL}?subject=Unsubscribe`} className="text-[#d4af37] underline underline-offset-4 hover:text-white">{UNION_EMAIL}</a> and we’ll take you off the list.
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#3d0202] text-white font-serif flex-1">
        <section className="px-4 sm:px-6 md:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">{body}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}

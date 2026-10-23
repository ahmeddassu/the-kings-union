// Homepage intro: the crest fades in on maroon for a moment, then the curtain
// lifts onto the title. Shown once per visit (a returning visitor in the same
// browser session goes straight to the page), never for people who turn off
// motion, and it never blocks the page: it's pure CSS, and the content is
// underneath from the start.
const skipScript = `try{if(sessionStorage.getItem("ku-intro")){document.documentElement.classList.add("no-intro")}else{sessionStorage.setItem("ku-intro","1")}}catch(e){}`;

export default function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: skipScript }} />
      <div aria-hidden="true" className="intro fixed inset-0 z-[90] flex items-center justify-center bg-[#2a0101]">
        <div className="intro-mark flex flex-col items-center">
          <img src="/crest-gold.png" alt="" width={239} height={280} className="h-32 sm:h-40 w-auto" />
          <span className="intro-rule mt-6 block h-px w-24 bg-[#d4af37]" />
        </div>
      </div>
    </>
  );
}

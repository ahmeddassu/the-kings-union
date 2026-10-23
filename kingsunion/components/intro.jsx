// Homepage intro: the crest on maroon, then the chamber doors swing open onto
// the page. Shown once per visit (a returning visitor in the same browser
// session goes straight to the page), never for people who turn off motion,
// and it never blocks the page: it's pure CSS over content that's already there.
const skipScript = `try{if(sessionStorage.getItem("ku-intro")){document.documentElement.classList.add("no-intro")}else{sessionStorage.setItem("ku-intro","1")}}catch(e){}`;

export default function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: skipScript }} />
      <div aria-hidden="true" className="intro fixed inset-0 z-[90] [perspective:1800px]">
        <span className="intro-door intro-door-left" />
        <span className="intro-door intro-door-right" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="intro-mark flex flex-col items-center">
            <img src="/crest-gold.png" alt="" width={239} height={280} className="h-32 sm:h-40 w-auto" />
            <span className="intro-rule mt-6 block h-px w-24 bg-[#d4af37]" />
          </div>
        </div>
      </div>
    </>
  );
}

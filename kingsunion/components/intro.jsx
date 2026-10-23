// Homepage intro: the Union crest is drawn in gold line on maroon, fills in,
// then expands towards you and opens onto the page. Shown once per visit (a
// returning visitor in the same browser session goes straight to the page),
// never for people who turn off motion, and it never blocks the page: it's
// pure CSS over content that's already there. The drawing itself lives in
// public/crest-draw.svg (traced from the crest artwork).
const skipScript = `try{if(sessionStorage.getItem("ku-intro")){document.documentElement.classList.add("no-intro")}else{sessionStorage.setItem("ku-intro","1")}}catch(e){}`;

export default function Intro() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: skipScript }} />
      <link rel="preload" href="/crest-draw.svg" as="image" />
      <div aria-hidden="true" className="intro fixed inset-0 z-[90] flex items-center justify-center">
        <img src="/crest-draw.svg" alt="" width={1048} height={1224} className="intro-crest h-48 sm:h-60 w-auto" />
      </div>
    </>
  );
}

// Homepage intro: the crest on maroon, a gold line drawn where the chamber
// doors meet, then the doors swing open onto the page.
//
// To keep it smooth, the doors only open once the page underneath has loaded
// (and the crest has been on screen for at least HOLD_MS), so nothing is still
// loading while they move. If loading is slow, they open after MAX_MS anyway.
// Shown once per visit, never for people who turn off motion, and only when
// scripts run (so it can never get stuck). The styles are in globals.css.
const HOLD_MS = 2200;
const MAX_MS = 4500;

const script = `(function(){var d=document.documentElement;
try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(sessionStorage.getItem("ku-intro")){d.classList.add("no-intro");return}
sessionStorage.setItem("ku-intro","1")}catch(e){return}
d.classList.add("intro-run");
var t0=performance.now(),opened=false;
function open(){if(!opened){opened=true;d.classList.add("intro-open")}}
function ready(){setTimeout(open,Math.max(0,${HOLD_MS}-(performance.now()-t0)))}
setTimeout(open,${MAX_MS});
var hero=new Image();hero.src="/hero.jpg";
var decoded=hero.decode?hero.decode().catch(function(){}):Promise.resolve();
if(document.readyState==="complete"){decoded.then(ready)}else{window.addEventListener("load",function(){decoded.then(ready)})}
})();`;

export default function Intro() {
  return (
    <>
      <link rel="preload" href="/crest-gold.png" as="image" fetchPriority="high" />
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div aria-hidden="true" className="intro fixed inset-0 z-[90] [perspective:1800px]">
        <span className="intro-door intro-door-left" />
        <span className="intro-door intro-door-right" />
        {/* The gold line where the doors meet */}
        <span className="intro-seam" />
        <img
          src="/crest-gold.png"
          alt=""
          width={239}
          height={280}
          decoding="sync"
          fetchPriority="high"
          className="intro-mark absolute left-1/2 top-1/2 h-32 sm:h-40 w-auto"
        />
      </div>
    </>
  );
}

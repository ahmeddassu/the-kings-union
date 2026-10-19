// Michaelmas term card. Each entry gets its own page at /events/<slug>.
// Fill in description, venue, speakers and result as they're confirmed.

export const termName = "Michaelmas Term 2026";

export const events = [
  {
    slug: "no-confidence-in-his-majestys-government",
    date: "2026-09-22",
    time: "19:00",
    type: "Debate",
    title: "This House has no confidence in His Majesty’s Government",
  },
  {
    slug: "film-screening-obsession",
    date: "2026-09-24",
    time: "18:30",
    type: "Film Screening",
    title: "Obsession (2025)",
  },
  {
    slug: "ban-social-media-for-under-sixteens",
    date: "2026-09-29",
    time: "19:00",
    type: "Debate",
    title: "This House would ban social media for under-sixteens",
  },
  {
    slug: "would-not-march-on-october-7th",
    date: "2026-10-06",
    time: "18:30",
    type: "Debate",
    title: "This House would not march on October 7th",
  },
  {
    slug: "two-percent-wealth-tax",
    date: "2026-10-13",
    time: "19:00",
    type: "Debate",
    title: "This House would levy a two-percent wealth tax on assets above £10 million",
  },
  {
    slug: "abolish-private-schools",
    date: "2026-10-20",
    time: "19:00",
    type: "Debate",
    title: "This House would abolish private schools",
  },
  {
    slug: "religion-opium-of-the-masses",
    date: "2026-10-27",
    time: "19:00",
    type: "Debate",
    title: "This House believes religion is the opium of the masses",
  },
  {
    slug: "rearm-the-west",
    date: "2026-11-13",
    time: "19:00",
    type: "Debate",
    title: "This House would rearm the West",
  },
  {
    slug: "restore-the-death-penalty",
    date: "2026-11-17",
    time: "19:00",
    type: "Debate",
    title: "This House would restore the death penalty",
  },
  {
    slug: "independent-scotland",
    date: "2026-11-24",
    time: "19:00",
    type: "Debate",
    title: "This House would vote for an independent Scotland",
  },
  {
    slug: "knifed-caesar",
    date: "2026-12-08",
    time: "19:00",
    type: "Debate",
    title: "This House would have knifed Caesar",
  },
];

// Optional per-event details. Leave a field out and the page shows a placeholder.
// Example:
// "abolish-private-schools": {
//   description: "…",
//   venue: "…",
//   proposition: ["Name", "Name", "Name"],
//   opposition: ["Name", "Name", "Name"],
//   result: { proposition: 40, opposition: 32 },
//   chathamHouse: true, // hides speakers
//   photo: "/events/abolish-private-schools.jpg", // a file in public/, or a full image URL
//   tickets: "https://luma.com/…", // ticket link: shows "Get tickets" buttons until the event has happened
//   ticketStatus: "Selling fast", // optional: overrides the automatic ticket label (see lib/tickets.js)
//   background: "/events/file.jpg", // faded image behind the title on the event page
//   backgroundCredit: { text: "Photo: Name, CC BY 2.0", href: "https://…" }, // if the image needs crediting
//   backgroundBlur: true, // blur the background (good for small images)
//   backgroundPosition: "center", // which part of the image to keep: "right" (default), "center" or "left"
//   poster: "/events/file.jpg", // a film poster shown beside the title
// },
export const details = {
  "film-screening-obsession": {
    description:
      "Made with a budget of under $1 million, Obsession became the surprise horror hit of 2026, grossing over $370 million worldwide and earning comparisons to greats such as Barbarian and Weapons. A vivid depiction of a darkly comic story of one wish gone horribly wrong, it divides critics: is it a morality tale about young men and romantic honesty, or something altogether bleaker? The Union gathered to watch and decide for themselves.",
    poster: "/events/obsession-poster.jpg",
    background: "/events/obsession-poster.jpg",
    backgroundBlur: true,
    backgroundCredit: {
      text: "Poster © Focus Features / Blumhouse",
      href: "https://en.wikipedia.org/wiki/Obsession_(2025_film)",
    },
  },
  "knifed-caesar": {
    background: "/events/caesar.jpg",
    backgroundPosition: "center",
    backgroundCredit: {
      text: "Vincenzo Camuccini, The Death of Julius Caesar (c. 1805). Public domain",
      href: "https://en.wikipedia.org/wiki/Vincenzo_Camuccini",
    },
    description:
      "44 BC. Julius Caesar’s corpse lies motionless in the Curia, riddled with stab wounds – over sixty conspirators assassinated the Roman dictator purportedly in defence of the Republic. Caesar’s assassination at the hands of Rome’s senators sparked years of civil war and the birth of the Empire. Covering themes of political violence, ever-enthralling classical history and the rule of law in times of crisis, this motion is sure to be an exciting finale to the term.",
  },
  "independent-scotland": {
    background: "/events/scotland.jpg",
    backgroundPosition: "center",
    backgroundCredit: {
      text: "Photo: Rhys Asplundh, CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Scottish_Waving_Flag_(6166970032).jpg",
    },
    description:
      "Despite the 2014 Scottish independence referendum ending with Scotland staying in the United Kingdom, the question of independence has remained controversial and hotly contested. Britain’s departure from the European Union and the rise of Reform UK have bolstered fresh support for Scotland breaking free of the Act of Union and becoming an independent, sovereign state – should England and Scotland part ways, or are we better off together?",
  },
  "rearm-the-west": {
    background: "/events/rearm.jpg",
    backgroundCredit: {
      text: "Photo: Sgt Ralph Merry, RAF/MOD. © Crown copyright, OGL",
      href: "https://commons.wikimedia.org/wiki/File:RAF_Typhoon_and_French_Mirage_Flying_together_MOD_45156244.jpg",
    },
    description:
      "With conflicts raging in the Middle East and Ukraine, controversy over the West’s levels of defence spending is growing. Earlier this year, then-Defence Secretary John Healey resigned, arguing that the government had not committed to properly funding defence. Should Britain and the West double down on rearmament efforts to deter growing threats, or should the West’s foreign policy be reassessed and funding focused on domestic issues and public services?",
  },
  "restore-the-death-penalty": {
    background: "/events/death-penalty.jpg",
    backgroundCredit: {
      text: "Photo: Florida Department of Corrections / Doug Smith. Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Florida_electric-chair.jpg",
    },
    description:
      "Britain remains divided over whether to restore the death penalty. A 2025 YouGov poll found 50% in favour of reintroducing capital punishment to 45% against. With an increasing number of members of Parliament supporting the policy in a limited capacity, as well as Reform UK’s chairman and Restore Britain supporting a referendum on this very issue, this motion aims to weigh the merits of executing society’s worst offenders against its potential risks and feasibility.",
  },
  "religion-opium-of-the-masses": {
    background: "/events/religion.jpg",
    backgroundCredit: {
      text: "Albrecht Dürer, Praying Hands (1508). Public domain",
      href: "https://en.wikipedia.org/wiki/Praying_Hands_(D%C3%BCrer)",
    },
    description:
      "In 1843, philosopher and political theorist Karl Marx wrote that “religion is the opium of the masses” – a line that would prove to be one of the most controversial phrases in human history. Suggesting that religion is a man-made response to suffering in society, it encapsulates eternal debates surrounding the existence of God, organised religion and its role in modern society. Is religion merely an illusory source of happiness, or is something deeper and more meaningful present?",
  },
  "abolish-private-schools": {
    background: "/events/private-schools.jpg",
    backgroundPosition: "center",
    backgroundCredit: {
      text: "Photo: Herry Lawford, CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Eton_College_(2)_-_August_5,_2007.jpg",
    },
    description:
      "Following the government’s decision in 2024 to apply VAT to private school fees, calls remain for further action to be taken to bring independent schools into the state sector in order to reduce societal inequalities. Critics allege that private schools are anachronistic and have no place in a fairer, twenty-first century Britain. Are private schools really unethical engines of elitism, or are they critical for aspirational families and educational diversity?",
    venue: "KIN427",
    tickets: "https://luma.com/yp2wqhj0",
  },
  "no-confidence-in-his-majestys-government": {
    description:
      "The Union kicks off the year with the traditional confidence vote in the government of the day. 2026 saw Sir Keir Starmer leave 10 Downing Street, succeeded as prime minister by former Mayor of Manchester Andy Burnham. With the new Burnham premiership promising a new type of politics and changes to the economy, local government and Britain’s foreign policy, has the Labour government restored its support from the British people?",
    background: "/events/westminster.jpg",
    backgroundCredit: {
      text: "Photo: mattbuck, CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:London_MMB_%C2%BB0Y4_River_Thames_and_Palace_of_Westminster.jpg",
    },
    venue: "College Chapel",
    proposition: ["Liam Halligan", "Zehna Ahmad", "Robert Young"],
    opposition: ["Neal Lawson", "Arvind Iyengar", "Fernando Marco"],
    result: { proposition: 58, opposition: 73 },
  },
  "ban-social-media-for-under-sixteens": {
    description:
      "Following the lead of Australia and other OECD nations, then-Prime Minister Sir Keir Starmer announced his intention to ban many social media sites for under-sixteens. With his successor Andy Burnham pledging to roll out the ban in spring 2027 with cross-party support, the Union will debate the policy’s merits and drawbacks. Is a social media ban for under-sixteens sound policy to protect British children, or an ineffective solution and infringement on our freedoms?",
    venue: "College Chapel",
    proposition: ["Munira Wilson", "Cai Finch", "Pranav Karthikeyan"],
    opposition: ["Dr Christopher Snowdon", "Juan Duve", "George Phantom"],
    result: { proposition: 62, opposition: 73 },
    background: "/events/social-media.jpg",
    backgroundCredit: {
      text: "Photo: mikemacmarketing, CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Social_Media_App_Icons_On_The_Screen_of_A_Smartphone.jpg",
    },
  },
  "two-percent-wealth-tax": {
    background: "/events/treasury.jpg",
    backgroundCredit: {
      text: "Photo: Ian Paterson, CC BY-SA 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Treasury_Buildings_-_geograph.org.uk_-_848056.jpg",
    },
    description:
      "Against the backdrop of a cost of living crisis and rising inequality, calls for a wealth tax from politicians, academics and activists have grown significantly, with members of Parliament from the Greens, Labour and Liberal Democrats signing parliamentary motions in support of the policy. Is a wealth tax what Britain needs to fund its public services and create a more equal society, or would it punish wealth creators and prove to be unworkable in practice?",
    venue: "Anatomy Lecture Theatre",
    proposition: ["Dr Benjamin Tippet", "Eva Tomás Sastre", "Cole Brydson"],
    opposition: ["Dr Kristian Niemietz", "Charles Amos", "Seb Vials"],
    result: { proposition: 105, opposition: 41 },
  },
  "would-not-march-on-october-7th": {
    chathamHouse: true,
    result: { proposition: 62, opposition: 61 },
  },
};

function parts(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function shortDate(iso) {
  const d = parts(iso);
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${ordinal(d.getUTCDate())} ${month}`;
}

export function longDate(iso) {
  const d = parts(iso);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  return `${weekday} ${shortDate(iso)} ${d.getUTCFullYear()}`;
}

export function isMotion(event) {
  return event.type === "Debate";
}

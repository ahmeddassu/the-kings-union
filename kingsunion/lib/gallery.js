// Photos for the galleries. Put the image in public/gallery/ and add a line
// here. Use each photo once across the site: the homepage banner (hero.jpg),
// the About page (chamber.jpg) and Support Us (chapel-audience.jpg) already
// have their own, and these are used as photo strips on other pages:
//   speaker-at-altar.jpg (Speak), speakers-preparing.jpg (Apply to speak),
//   after-the-debate.jpg (Welcome), speaker-gesturing.jpg (Get involved),
//   front-bench.jpg (Membership), audience-profile.jpg (Motions),
//   speaker-before-the-chair.jpg (Debates), chapel-empty.jpg (Term Card),
//   chapel-benches.jpg (Contact), floor-speech.jpg (Governance),
//   speaker-with-microphone.jpg (Press).
// Debate pages only use their own photo (set in lib/events.js).
// A gallery shows only the photos listed; an empty list shows crest placeholders.

export const chamberGallery = [
  { src: "/gallery/chapel-floor.jpg", alt: "Speakers take the floor during a debate in the College Chapel" },
  { src: "/gallery/chapel-speaker.jpg", alt: "A visiting speaker makes his case in front of the chapel altar" },
  { src: "/gallery/chamber-wide.jpg", alt: "The chair presides as the House fills the College Chapel" },
  { src: "/gallery/speaker-and-chair.jpg", alt: "A guest speaker addresses the House, with the chair behind him" },
  { src: "/gallery/audience-listening.jpg", alt: "Members of the audience follow the debate from the benches" },
  { src: "/gallery/after-the-debate-2.jpg", alt: "Speakers and members talk after the vote" },
  { src: "/gallery/speaker-reads-statement.jpg", alt: "A guest speaker reads her opening statement to the House" },
  { src: "/gallery/floor-question.jpg", alt: "A member puts a question to the speakers from the floor" },
  { src: "/gallery/speaker-in-profile.jpg", alt: "A guest speaker answers a point from the floor" },
];

export const socialGallery = [];

// Faded image behind the homepage's Past Debates section (a gavel from
// Wikimedia Commons). Put the file in public/ and fill in the credit exactly as
// the Commons page gives it ("Use this file" → attribution). Leave src blank to
// show no background.
export const pastDebatesBackground = {
  src: "",
  credit: "", // e.g. "Gavel: Author Name, CC BY-SA 4.0, via Wikimedia Commons"
  href: "", // the file's Commons page
};

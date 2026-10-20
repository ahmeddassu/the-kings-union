// Profiles for committee members and editors. A person's card links to their
// profile (kingsunion.org.uk/team/<slug>) once they're listed here; everyone
// else keeps a plain card. Only add details each person has sent in themselves.
//
// {
//   slug: "first-last",            // the web address
//   name: "First Last",            // must match their name on the card exactly
//   role: "Role",
//   image: "/people/file.jpg",
//   course: "Course, year",
//   bio: ["Paragraph.", "Paragraph."],
//   favouriteMotion: "This House would …", // a motion from the term card
//   linkedin: "https://…",
//   back: { href: "/kingsway", label: "Kingsway" }, // where "←" goes (default: the committee)
// }
export const profiles = [
  {
    slug: "guy-de-basto",
    name: "Guy de Basto",
    role: "Editor-in-Chief, Kingsway",
    image: "/people/guy.jpg",
    course: "Liberal Arts (Politics Major), 2nd year",
    bio: [
      "Editor-in-Chief of Kingsway, the Union’s magazine.",
      "I helped set up the Union as Treasurer last year, to give students a fantastic spot for debate about the salient issues of the day, and an even better community behind it.",
    ],
    favouriteMotion: "This House would have knifed Caesar",
    linkedin: "https://uk.linkedin.com/in/guy-de-basto",
    back: { href: "/kingsway", label: "Kingsway" },
  },
];

export const profileFor = (name) => (name ? profiles.find((p) => p.name === name) : undefined);
export const profileHref = (name) => {
  const p = profileFor(name);
  return p ? `/team/${p.slug}` : null;
};

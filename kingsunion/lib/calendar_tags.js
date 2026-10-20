// The seven colour tags for the term card calendar. Chosen to sit with the
// Union's maroon and gold and to stay distinct from one another; every tag is
// always shown with its name too, never by colour alone.
export const TAGS = [
  { key: "debate", label: "Debate", colour: "#b68b16" },
  { key: "kingsway", label: "Kingsway", colour: "#788ed6" },
  { key: "social", label: "Social", colour: "#29a895" },
  { key: "screening", label: "Screening", colour: "#b84999" },
  { key: "deadline", label: "Deadline", colour: "#a3563b" },
  { key: "members", label: "Members", colour: "#654abb" },
  { key: "other", label: "Other", colour: "#0b764d" },
];

export const tagFor = (key) => TAGS.find((t) => t.key === key) || TAGS[TAGS.length - 1];

// Term card events get a tag from their "Type".
export function tagForType(type = "") {
  const t = type.toLowerCase();
  if (t.includes("debate")) return "debate";
  if (t.includes("film") || t.includes("screening")) return "screening";
  if (t.includes("social") || t.includes("pub") || t.includes("drinks") || t.includes("dinner")) return "social";
  if (t.includes("agm") || t.includes("election") || t.includes("member")) return "members";
  if (t.includes("kingsway")) return "kingsway";
  if (t.includes("deadline")) return "deadline";
  return "other";
}

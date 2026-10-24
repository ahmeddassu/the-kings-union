// Orders people most senior first within a department, going by their roles.
// A role naming another department ("Director of Finance") belongs to that
// department, so doesn't count here. Safe to use in the browser.
const RANKS = ["president", "vice president", "chief of staff", "deputy chief of staff", "director", "editor-in-chief", "deic", "deputy", "head", "manager", "bursar", "officer", "associate"];

function rankOf(part) {
  const r = part.toLowerCase();
  if (r.includes("deputy chief of staff")) return RANKS.indexOf("deputy chief of staff");
  const i = RANKS.findIndex((k) => (k === "president" ? /^president\b/.test(r) : r.includes(k)));
  return i < 0 ? RANKS.length : i;
}

export function rolesIn(person, dept, allDepts) {
  const parts = String(person.role || "").split(",").map((x) => x.trim()).filter(Boolean);
  const here = parts.filter((x) => !allDepts.some((g) => g !== dept && x.toLowerCase().includes(g.toLowerCase())));
  return here.length ? here : parts;
}

export function rankIn(person, dept, allDepts) {
  return Math.min(RANKS.length, ...rolesIn(person, dept, allDepts).map(rankOf));
}

export function byRank(people, dept, allDepts) {
  return people
    .map((p, i) => [p, i])
    .sort((a, b) => rankIn(a[0], dept, allDepts) - rankIn(b[0], dept, allDepts) || a[1] - b[1])
    .map(([p]) => p);
}

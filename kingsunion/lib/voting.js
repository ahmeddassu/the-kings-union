// Live voting: debates, codes and votes, kept in the voting database.
//
// Keys:
//   ku:debates            set of debate ids
//   ku:debate:<id>        the debate (JSON)
//   ku:code:<12345>       debate id for a 5-digit code
//   ku:votes:<id>:aye     number of Ayes   ku:votes:<id>:no   number of Noes
//   ku:voters:<id>        set of voter ids who have voted (one vote each)
//   ku:ballots:<id>       hash voter id -> "aye" | "no"
//   ku:published          JSON list of results shown on the public website
import { randomBytes, randomInt } from "node:crypto";
import { redis, pipeline } from "@/lib/store";

export const CHOICES = ["aye", "no"];
export const STATUS = { draft: "Not open yet", open: "Voting open", closed: "Voting closed" };

// Where the QR codes point. Set VOTING_URL in Vercel to override.
export const VOTING_URL = (process.env.VOTING_URL || "https://voting.kingsunion.org.uk").replace(/\/$/, "");
export const votingLink = (code) => `${VOTING_URL}/${code}`;

const k = {
  index: "ku:debates",
  debate: (id) => `ku:debate:${id}`,
  code: (code) => `ku:code:${code}`,
  votes: (id, c) => `ku:votes:${id}:${c}`,
  voters: (id) => `ku:voters:${id}`,
  ballots: (id) => `ku:ballots:${id}`,
  published: "ku:published",
};

const clean = (v, max = 300) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const names = (list) =>
  (Array.isArray(list) ? list : String(list || "").split(/[\n,]/))
    .map((n) => clean(n, 80))
    .filter(Boolean)
    .slice(0, 6);

// Turns form input into a tidy debate record (no id/code/status).
export function debateFields(input) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date || "") ? input.date : "";
  const time = /^\d{2}:\d{2}$/.test(input.time || "") ? input.time : "";
  return {
    title: clean(input.title, 200),
    date,
    time,
    venue: clean(input.venue, 120),
    proposition: names(input.proposition),
    opposition: names(input.opposition),
    hideResults: Boolean(input.hideResults),
  };
}

export const isCode = (code) => /^\d{5}$/.test(String(code || ""));

export async function getDebate(id) {
  if (!/^[a-f0-9]{12}$/.test(String(id || ""))) return null;
  const raw = await redis("GET", k.debate(id));
  return raw ? JSON.parse(raw) : null;
}

export async function getDebateByCode(code) {
  if (!isCode(code)) return null;
  const id = await redis("GET", k.code(code));
  return id ? getDebate(id) : null;
}

export async function listDebates() {
  const ids = await redis("SMEMBERS", k.index);
  if (!ids?.length) return [];
  const raws = await redis("MGET", ...ids.map(k.debate));
  return raws
    .filter(Boolean)
    .map((r) => JSON.parse(r))
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`) || b.createdAt - a.createdAt);
}

export async function createDebate(input) {
  const fields = debateFields(input);
  if (!fields.title) throw new Error("Please enter the motion.");
  const id = randomBytes(6).toString("hex");

  // A random 5-digit code no other debate is using.
  let code = null;
  for (let i = 0; i < 25 && !code; i++) {
    const candidate = String(randomInt(10000, 100000));
    if ((await redis("SET", k.code(candidate), id, "NX")) === "OK") code = candidate;
  }
  if (!code) throw new Error("Couldn't find a free code. Please try again.");

  const debate = { id, code, status: "draft", published: false, createdAt: Date.now(), ...fields };
  await pipeline([
    ["SET", k.debate(id), JSON.stringify(debate)],
    ["SADD", k.index, id],
  ]);
  return debate;
}

async function save(debate) {
  await redis("SET", k.debate(debate.id), JSON.stringify(debate));
  await syncPublished();
  return debate;
}

export async function updateDetails(id, input) {
  const debate = await getDebate(id);
  if (!debate) return null;
  const fields = debateFields(input);
  if (!fields.title) throw new Error("Please enter the motion.");
  return save({ ...debate, ...fields });
}

// Votes actually cast on phones (from the ballots), regardless of any manual
// adjustment to the totals.
export async function getCountedVotes(id) {
  const values = (await redis("HVALS", k.ballots(id))) || [];
  const aye = values.filter((v) => v === "aye").length;
  const no = values.filter((v) => v === "no").length;
  return { aye, no, total: aye + no };
}

const MAX_COUNT = 100000;
const toCount = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > MAX_COUNT) {
    throw new Error("Please enter whole numbers between 0 and 100,000.");
  }
  return n;
};

// Sets the Aye/No totals by hand (paper ballots, a recount, a correction).
// Phone votes cast afterwards are added on top. Every change is logged for
// admins only.
async function setTotals(debate, aye, no, kind) {
  const before = await getCounts(debate.id);
  await pipeline([
    ["SET", k.votes(debate.id, "aye"), aye],
    ["SET", k.votes(debate.id, "no"), no],
  ]);
  const entry = { at: Date.now(), kind, from: [before.aye, before.no], to: [aye, no] };
  const adjustments = [...(debate.adjustments || []), entry].slice(-20);
  return save({ ...debate, adjustments });
}

// Admin actions on a debate.
export async function applyAction(id, action, body = {}) {
  const debate = await getDebate(id);
  if (!debate) return null;
  const now = Date.now();
  switch (action) {
    case "setCounts":
      return setTotals(debate, toCount(body.aye), toCount(body.no), "set");
    case "restoreCounted": {
      const counted = await getCountedVotes(id);
      return setTotals(debate, counted.aye, counted.no, "restore");
    }
    case "open":
      return save({ ...debate, status: "open", openedAt: debate.openedAt || now });
    case "close":
      return save({ ...debate, status: "closed", closedAt: now });
    case "reopen":
      return save({ ...debate, status: "open" });
    case "hide":
      return save({ ...debate, hideResults: true });
    case "reveal":
      return save({ ...debate, hideResults: false });
    case "publish":
      return save({ ...debate, published: true });
    case "unpublish":
      return save({ ...debate, published: false });
    case "reset":
      await pipeline([
        ["DEL", k.votes(id, "aye"), k.votes(id, "no"), k.voters(id), k.ballots(id)],
      ]);
      return save({ ...debate, status: "draft", openedAt: null, closedAt: null, adjustments: [] });
    default:
      throw new Error("Unknown action.");
  }
}

export async function deleteDebate(id) {
  const debate = await getDebate(id);
  if (!debate) return false;
  await pipeline([
    ["DEL", k.debate(id), k.votes(id, "aye"), k.votes(id, "no"), k.voters(id), k.ballots(id)],
    ["DEL", k.code(debate.code)],
    ["SREM", k.index, id],
  ]);
  await syncPublished();
  return true;
}

export async function getCounts(id) {
  const [aye, no] = await redis("MGET", k.votes(id, "aye"), k.votes(id, "no"));
  const a = Number(aye) || 0;
  const n = Number(no) || 0;
  return { aye: a, no: n, total: a + n };
}

// The voter's earlier choice for this debate, or null.
export async function getBallot(id, voterId) {
  if (!voterId) return null;
  return (await redis("HGET", k.ballots(id), voterId)) || null;
}

// Records one vote. Returns { ok: true } or { ok: false, reason }.
export async function castVote(debate, voterId, choice) {
  if (!CHOICES.includes(choice)) return { ok: false, reason: "invalid" };
  if (debate.status !== "open") return { ok: false, reason: debate.status === "closed" ? "closed" : "not-open" };
  // Adding the voter to the set is atomic, so each voter can only ever vote once.
  const added = await redis("SADD", k.voters(debate.id), voterId);
  if (!added) return { ok: false, reason: "already-voted" };
  await pipeline([
    ["HSET", k.ballots(debate.id), voterId, choice],
    ["INCR", k.votes(debate.id, choice)],
  ]);
  return { ok: true };
}

// What everyone may see about a debate (no internal fields).
export function publicView(debate, counts) {
  const showCounts = !debate.hideResults || debate.status === "closed";
  return {
    title: debate.title,
    date: debate.date,
    time: debate.time,
    venue: debate.venue,
    proposition: debate.proposition,
    opposition: debate.opposition,
    code: debate.code,
    status: debate.status,
    hidden: !showCounts,
    counts: showCounts ? counts : null,
  };
}

// Keeps the list of published results the public website reads.
async function syncPublished() {
  const debates = await listDebates();
  const out = [];
  for (const d of debates) {
    if (!d.published || d.status !== "closed") continue;
    const c = await getCounts(d.id);
    out.push({ title: d.title, date: d.date, proposition: c.aye, opposition: c.no });
  }
  await redis("SET", k.published, JSON.stringify(out));
}

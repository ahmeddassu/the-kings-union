// Latest Kingsway articles, read from the Substack feed.
// New posts appear on the site within the hour. If the feed can't be
// reached, the site shows the snapshot below instead of an empty section.

import { KINGSWAY_URL } from "@/lib/nav";

const FEED_URL = new URL("feed", KINGSWAY_URL).toString();
const REFRESH_SECONDS = 3600;

const snapshot = [
  {
    title: "The Toughest Job in Sport wears Number 12",
    link: "https://kcuskingsway.substack.com/p/the-toughest-job-in-sport-wears-number",
    date: "2026-10-15",
    image: "https://substackcdn.com/image/fetch/$s_!ll_i!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbedc0395-5497-4aee-9826-b226c4237d0c_1024x577.png",
    description: "Guy de Basto, a second-year History, Politics and Philosophy student at King’s College London, argues that the Quarterback (QB) drew the shortest stick across all sports.",
  },
  {
    title: "The Psychology Behind The Pedestal Given By The Crowd",
    link: "https://kcuskingsway.substack.com/p/the-psychology-behind-the-pedestal",
    date: "2026-10-14",
    image: "https://substackcdn.com/image/fetch/$s_!Kixg!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fab5fb68c-abd6-45ff-80cb-41cbe336d16b_960x645.jpeg",
    description: "Hadiyah Muin, a first-year History & War Studies student at King’s College London, questions the motivations behind our belief systems.",
  },
  {
    title: "This House Would Choose the Dog Over All.",
    link: "https://kcuskingsway.substack.com/p/this-house-would-choose-the-dog-over",
    date: "2026-10-13",
    image: "https://substackcdn.com/image/fetch/$s_!CzHH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77491464-d3be-4ed6-91ad-5f67e8c5f7e7_960x641.jpeg",
    description: "Guy de Basto, a second-year History, Politics and Philosophy student at King’s College London, makes the case for why dogs are superior to all other pets.",
  },
  {
    title: "Deliberation Makes Democracy Work — and It’s Under Threat",
    link: "https://kcuskingsway.substack.com/p/deliberation-makes-democracy-work",
    date: "2026-09-07",
    image: "https://images.unsplash.com/photo-1607778417094-1fef13315e6e?fm=jpg&q=60&w=1200&auto=format&fit=crop",
    description: "Maddox Wolfe, a second-year Law student at King’s College London, argues passionately that democracy must prioritise deliberation over popular sentiment.",
  },
  {
    title: "Troy Or Greece? - You Decide",
    link: "https://kcuskingsway.substack.com/p/troy-or-greece-you-decide",
    date: "2026-09-06",
    image: "https://substackcdn.com/image/fetch/$s_!WymG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c13883-0b2e-412b-b97b-a3cb68d4d141_800x473.jpeg",
    description: "Team Troy vs Team Greece. Writers Cherry Cain and Dexter Dédalo both pick a side in the ultimate ancient grudge match. They also argue you should too.",
  },
  {
    title: "Opinion: Nigel Farage's Resignation From Parliament Was A Farcical Stunt",
    link: "https://kcuskingsway.substack.com/p/opinion-nigel-farages-resignation",
    date: "2026-08-13",
    image: "https://substackcdn.com/image/fetch/$s_!AOKq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc825f676-87f7-4642-8d23-d4cc0d8a89ab_8256x5504.jpeg",
    description: "Attila Fekete, a second-year Law student at King's College London, argues that Reform UK leader Nigel Farage's decision to resign his position as an MP and trigger a by-election was disgraceful.",
  },
];

const decode = (s = "") =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};

function parseFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const enclosure = item.match(/<enclosure[^>]*url="([^"]+)"/);
    const pub = new Date(tag(item, "pubDate"));
    return {
      title: tag(item, "title"),
      link: tag(item, "link"),
      date: isNaN(pub) ? "" : pub.toISOString().slice(0, 10),
      image: enclosure ? decode(enclosure[1]) : "",
      description: tag(item, "description").replace(/<[^>]+>/g, ""),
    };
  });
}

export async function getKingswayPosts(limit = 6) {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: REFRESH_SECONDS } });
    if (!res.ok) throw new Error(`Feed returned ${res.status}`);
    const posts = parseFeed(await res.text()).filter((p) => p.title && p.link);
    if (!posts.length) throw new Error("Feed is empty");
    return posts.slice(0, limit);
  } catch (err) {
    console.warn(`Kingsway feed unavailable, using snapshot: ${err.message}`);
    return snapshot.slice(0, limit);
  }
}

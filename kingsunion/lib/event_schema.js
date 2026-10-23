// Google event listings: structured data describing an event, so it can appear
// in Google's events results with its date, time and venue.
// https://developers.google.com/search/docs/appearance/structured-data/event
import { eventTimes } from "@/lib/calendar";
import { siteUrl, siteName } from "@/lib/site";

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "King’s College London, Strand",
  addressLocality: "London",
  postalCode: "WC2R 2LS",
  addressCountry: "GB",
};

// Waterloo Campus events (e.g. the Franklin-Wilkins Building) need their own
// address for Google; everything else is on the Strand.
const WATERLOO = {
  "@type": "PostalAddress",
  streetAddress: "Franklin-Wilkins Building, 150 Stamford Street",
  addressLocality: "London",
  postalCode: "SE1 9NH",
  addressCountry: "GB",
};
const addressFor = (venue) => (/waterloo|franklin.?wilkins/i.test(venue || "") ? WATERLOO : ADDRESS);

export function eventSchema(event) {
  const { start, end } = eventTimes(event);
  const page = new URL(`/events/${event.slug}`, siteUrl).toString();
  const image = event.photo || event.background || event.poster;
  const speakers = event.chathamHouse ? [] : [...(event.proposition || []), ...(event.opposition || [])];
  const name = event.type === "Debate" ? `King’s Union debate: “${event.title}”` : event.title;

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: page,
    location: {
      "@type": "Place",
      name: event.venue ? `${event.venue}, King’s College London` : "King’s College London",
      address: addressFor(event.venue),
    },
    organizer: { "@type": "Organization", "@id": new URL("/#organization", siteUrl).toString(), name: siteName, url: siteUrl.toString() },
    image: [new URL(image || "/og.jpg", siteUrl).toString()],
  };
  data.description =
    event.description ||
    (event.type === "Debate" ? `A King’s Union debate on the motion “${event.title}”, with a vote of the House at the end.` : `${event.title}, at the King’s Union.`);
  if (speakers.length) data.performer = speakers.map((n) => ({ "@type": "Person", name: n }));
  if (event.tickets) {
    data.offers = {
      "@type": "Offer",
      url: event.tickets,
      availability: "https://schema.org/InStock",
      // Debates are free (see lib/faq.js).
      ...(event.type === "Debate" ? { price: 0, priceCurrency: "GBP" } : {}),
      validFrom: new Date(start.getTime() - 21 * 864e5).toISOString(),
    };
  }
  return data;
}

// Home › Term Card › this event, for Google's breadcrumb trail in results.
export function eventBreadcrumbs(event) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl.toString() },
      { "@type": "ListItem", position: 2, name: "Term Card", item: new URL("/term-card", siteUrl).toString() },
      { "@type": "ListItem", position: 3, name: event.title, item: new URL(`/events/${event.slug}`, siteUrl).toString() },
    ],
  };
}

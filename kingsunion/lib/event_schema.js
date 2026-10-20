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
      address: ADDRESS,
    },
    organizer: { "@type": "Organization", name: siteName, url: siteUrl.toString() },
    image: [new URL(image || "/og.jpg", siteUrl).toString()],
  };
  if (event.description) data.description = event.description;
  if (speakers.length) data.performer = speakers.map((n) => ({ "@type": "Person", name: n }));
  if (event.tickets) {
    data.offers = {
      "@type": "Offer",
      url: event.tickets,
      availability: "https://schema.org/InStock",
      validFrom: new Date(start.getTime() - 21 * 864e5).toISOString(),
    };
  }
  return data;
}

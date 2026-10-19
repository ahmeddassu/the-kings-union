// "Add to calendar" links. Events are entered in London time; debates are
// assumed to last two hours unless an end time is set.

const DEFAULT_MINUTES = 120;

// Minutes London is ahead of UTC on a given date (0 in winter, 60 in summer).
function londonOffsetMinutes(utcDate) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).formatToParts(utcDate);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - utcDate.getTime()) / 60000);
}

export function eventTimes(event) {
  const [y, m, d] = event.date.split("-").map(Number);
  const [hh, mm] = (event.time || "19:00").split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const start = new Date(guess.getTime() - londonOffsetMinutes(guess) * 60000);
  const end = new Date(start.getTime() + (event.durationMinutes || DEFAULT_MINUTES) * 60000);
  return { start, end };
}

const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function details(event) {
  return event.type === "Debate" ? `King’s Union debate: “${event.title}”` : event.title;
}

export function googleCalendarUrl(event, pageUrl) {
  const { start, end } = eventTimes(event);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: details(event),
    dates: `${stamp(start)}/${stamp(end)}`,
    details: pageUrl ? `Details: ${pageUrl}` : "",
    location: event.venue || "King’s College London",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function outlookCalendarUrl(event, pageUrl) {
  const { start, end } = eventTimes(event);
  const q = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: details(event),
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: pageUrl ? `Details: ${pageUrl}` : "",
    location: event.venue || "King’s College London",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`;
}

const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function icsFile(event, pageUrl) {
  const { start, end } = eventTimes(event);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//King's Union//Term Card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@kingsunion`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(details(event))}`,
    `LOCATION:${esc(event.venue || "King’s College London")}`,
    pageUrl ? `URL:${pageUrl}` : null,
    pageUrl ? `DESCRIPTION:${esc("Details: " + pageUrl)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function vevent(event, pageUrl) {
  const { start, end } = eventTimes(event);
  return [
    "BEGIN:VEVENT",
    `UID:${event.slug}@kingsunion`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(details(event))}`,
    `LOCATION:${esc(event.venue || "King’s College London")}`,
    pageUrl ? `URL:${pageUrl}` : null,
    `DESCRIPTION:${esc([event.description, event.tickets ? "Tickets: " + event.tickets : "", pageUrl ? "Details: " + pageUrl : ""].filter(Boolean).join("\n\n"))}`,
    "END:VEVENT",
  ].filter(Boolean);
}

// The whole term card as one calendar people can subscribe to. Calendar apps
// re-check it regularly, so new or changed events appear by themselves.
export function icsCalendar(events, siteUrl) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//King's Union//Term Card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:The King’s Union",
    "X-WR-CALDESC:Debates and events from the King’s Union\\, King’s College London",
    "X-WR-TIMEZONE:Europe/London",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...events.flatMap((e) => vevent(e, new URL(`/events/${e.slug}`, siteUrl).toString())),
    "END:VCALENDAR",
  ].map(fold).join("\r\n");
}

// Calendar lines over 75 characters are split onto continuation lines.
function fold(line) {
  const parts = [];
  for (let i = 0; i < line.length; i += 70) parts.push(line.slice(i, i + 70));
  return parts.join("\r\n ");
}

// Links for subscribing to the term calendar.
export function subscribeLinks(siteUrl) {
  const feed = new URL("/calendar.ics", siteUrl);
  const webcal = `webcal://${feed.host}${feed.pathname}`;
  return {
    webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feed.toString())}&name=${encodeURIComponent("The King’s Union")}`,
    file: feed.pathname,
  };
}

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

function londonTime(isoDate, hhmm) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  return new Date(guess.getTime() - londonOffsetMinutes(guess) * 60000);
}

// Start and end as real moments. Uses the end date/time if one is set,
// otherwise assumes two hours.
export function eventTimes(event) {
  const start = londonTime(event.date, event.time || "19:00");
  let end = event.endTime ? londonTime(event.endDate || event.date, event.endTime) : null;
  if (!end || end <= start) end = new Date(start.getTime() + (event.durationMinutes || DEFAULT_MINUTES) * 60000);
  return { start, end };
}

// All-day entries (deadlines, reading week…): date-only, end date exclusive.
const dayStamp = (iso) => iso.replace(/-/g, "");
function nextDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}
function allDaySpan(event) {
  return { first: event.date, after: nextDay(event.endDate || event.date) };
}

const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function details(event) {
  return event.type === "Debate" ? `King’s Union debate: “${event.title}”` : event.title;
}

const uid = (event) => `${event.slug || event.id}@kingsunion`;

export function googleCalendarUrl(event, pageUrl) {
  let dates;
  if (event.allDay) {
    const { first, after } = allDaySpan(event);
    dates = `${dayStamp(first)}/${dayStamp(after)}`;
  } else {
    const { start, end } = eventTimes(event);
    dates = `${stamp(start)}/${stamp(end)}`;
  }
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: details(event),
    dates,
    details: pageUrl ? `Details: ${pageUrl}` : "",
    location: event.venue || "King’s College London",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function outlookCalendarUrl(event, pageUrl) {
  let startdt, enddt;
  if (event.allDay) {
    const { first, after } = allDaySpan(event);
    [startdt, enddt] = [first, after];
  } else {
    const { start, end } = eventTimes(event);
    [startdt, enddt] = [start.toISOString(), end.toISOString()];
  }
  const q = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: details(event),
    startdt,
    enddt,
    ...(event.allDay ? { allday: "true" } : {}),
    body: pageUrl ? `Details: ${pageUrl}` : "",
    location: event.venue || "King’s College London",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`;
}

const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

function timeLines(event) {
  if (event.allDay) {
    const { first, after } = allDaySpan(event);
    return [`DTSTART;VALUE=DATE:${dayStamp(first)}`, `DTEND;VALUE=DATE:${dayStamp(after)}`];
  }
  const { start, end } = eventTimes(event);
  return [`DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`];
}

// One event as a calendar file. It is also a live subscription: calendar apps
// that subscribe to it re-check it, so a changed time or venue updates itself.
export function icsFile(event, pageUrl) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//King's Union//Term Card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(`King’s Union: ${event.title}`)}`,
    "X-WR-TIMEZONE:Europe/London",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    "BEGIN:VEVENT",
    `UID:${uid(event)}`,
    `DTSTAMP:${stamp(new Date())}`,
    ...timeLines(event),
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
  return [
    "BEGIN:VEVENT",
    `UID:${uid(event)}`,
    `DTSTAMP:${stamp(new Date())}`,
    ...timeLines(event),
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
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    ...events.flatMap((e) => vevent(e, new URL(e.href || (e.slug ? `/events/${e.slug}` : "/term-card"), siteUrl).toString())),
    "END:VCALENDAR",
  ].map(fold).join("\r\n");
}

// Calendar lines over 75 characters are split onto continuation lines.
function fold(line) {
  const parts = [];
  for (let i = 0; i < line.length; i += 70) parts.push(line.slice(i, i + 70));
  return parts.join("\r\n ");
}

// Links that subscribe someone's calendar to a feed: the whole term
// (/calendar.ics) or a single event. Subscribed calendars re-check the feed by
// themselves, so changes to times and venues reach people automatically.
export function subscribeLinks(siteUrl, path = "/calendar.ics", name = "The King’s Union") {
  const feed = new URL(path, siteUrl);
  const webcal = `webcal://${feed.host}${feed.pathname}`;
  return {
    webcal,
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feed.toString())}&name=${encodeURIComponent(name)}`,
    file: feed.pathname,
  };
}

// The feed address for one calendar item (term card event or admin entry).
export const itemFeedPath = (item) =>
  item.source === "admin" || (!item.slug && item.id) ? `/api/calendar/${item.id}` : `/events/${item.slug}/calendar.ics`;

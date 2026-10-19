// "Selling fast" / "Last few tickets" / "Sold out" labels for events with tickets.
//
// AUTOMATIC: for Luma ticket links, the site checks Luma every five minutes and
// works out the label from how many tickets are left:
//   - sold out on Luma                          → "Sold out"
//   - Luma says nearly full, or ≤ 10% left       → "Last few tickets"
//   - half or more of the tickets gone           → "Selling fast"
//   - otherwise                                  → no label
//
// MANUAL OVERRIDE: write in the Google Sheet's "Ticket status" column
// (or `ticketStatus` in lib/events.js) to replace the automatic label:
//   "Selling fast", "Last few", "Sold out" → that label
//   "Hide"                                 → no label at all
//   anything else (e.g. "Free for members") → shown exactly as written
//   blank                                  → automatic

const REFRESH_SECONDS = 300;

export function lumaSlug(url) {
  const m = String(url || "").match(/^https?:\/\/(?:www\.)?(?:luma\.com|lu\.ma)\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/i);
  return m ? m[1] : null;
}

// Find every ticket type in Luma's reply, wherever it sits.
function ticketTypes(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => ticketTypes(n, out));
  else if (node && typeof node === "object") {
    if (typeof node.max_capacity === "number" && typeof node.spots_remaining === "number") out.push(node);
    else Object.values(node).forEach((v) => ticketTypes(v, out));
  }
  return out;
}

function findKey(node, key) {
  if (!node || typeof node !== "object") return undefined;
  if (key in node) return node[key];
  for (const v of Object.values(node)) {
    const found = findKey(v, key);
    if (found !== undefined) return found;
  }
  return undefined;
}

// Ticket numbers from Luma, or null if Luma can't be reached.
export async function lumaTickets(url) {
  const slug = lumaSlug(url);
  if (!slug) return null;
  try {
    const res = await fetch(`https://api.lu.ma/url?url=${encodeURIComponent(slug)}`, {
      next: { revalidate: REFRESH_SECONDS },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const info = findKey(data, "ticket_info") || {};
    const types = ticketTypes(data).filter((t) => !t.is_disabled);

    let capacity = types.reduce((n, t) => n + t.max_capacity, 0);
    let remaining = types.reduce((n, t) => n + Math.max(0, t.spots_remaining), 0);
    if (!capacity && typeof info.spots_remaining === "number") {
      const guests = Number(findKey(data, "guest_count")) || 0;
      remaining = info.spots_remaining;
      capacity = remaining + guests;
    }

    return {
      soldOut: Boolean(info.is_sold_out) || (capacity > 0 && remaining === 0),
      nearCapacity: Boolean(info.is_near_capacity),
      remaining,
      capacity,
    };
  } catch {
    return null;
  }
}

const LABELS = {
  soldout: "Sold out",
  few: "Last few tickets",
  fast: "Selling fast",
};

// Returns { key, label } or null. key is "soldout", "few", "fast" or "custom".
export async function ticketStatus(event) {
  if (!event?.tickets) return null;

  const override = String(event.ticketStatus || "").trim();
  if (override) {
    const o = override.toLowerCase();
    if (/^(hide|none|off|no)$/.test(o)) return null;
    if (o.includes("sold")) return { key: "soldout", label: LABELS.soldout };
    if (o.includes("few") || o.includes("last")) return { key: "few", label: LABELS.few };
    if (o.includes("fast")) return { key: "fast", label: LABELS.fast };
    return { key: "custom", label: override };
  }

  const t = await lumaTickets(event.tickets);
  if (!t || !t.capacity) return t?.soldOut ? { key: "soldout", label: LABELS.soldout } : null;
  if (t.soldOut) return { key: "soldout", label: LABELS.soldout };
  if (t.nearCapacity || t.remaining <= Math.max(5, t.capacity * 0.1)) return { key: "few", label: LABELS.few };
  if (t.remaining <= t.capacity * 0.5) return { key: "fast", label: LABELS.fast };
  return null;
}

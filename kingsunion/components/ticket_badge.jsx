// Small label next to ticket buttons: "Selling fast", "Last few tickets", "Sold out".
// `status` comes from ticketStatus() in lib/tickets.js.
export default function TicketBadge({ status, onGold = false, className = "" }) {
  if (!status) return null;
  const base = "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap";
  const tone = onGold
    ? "text-[#3d0202]"
    : status.key === "soldout"
      ? "text-white/60"
      : "text-[#d4af37]";
  return (
    <span className={`${base} ${tone} ${className}`}>
      {status.key !== "soldout" && (
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${onGold ? "bg-[#3d0202]" : "bg-[#d4af37]"} animate-pulse motion-reduce:animate-none`} />
      )}
      {status.label}
    </span>
  );
}

// Button text that suits the status.
export function ticketButtonText(status) {
  return status?.key === "soldout" ? "Join the waitlist →" : "Get tickets →";
}

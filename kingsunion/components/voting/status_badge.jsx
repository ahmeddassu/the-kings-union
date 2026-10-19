const styles = {
  draft: "border-white/40 text-white/70",
  open: "border-[#d4af37] bg-[#d4af37] text-[#3d0202]",
  closed: "border-white/60 text-white",
};
const labels = { draft: "Not open", open: "Voting open", closed: "Closed" };

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${styles[status]}`}>
      {status === "open" && <span className="h-2 w-2 rounded-full bg-[#3d0202] animate-pulse motion-reduce:animate-none" aria-hidden="true" />}
      {labels[status]}
    </span>
  );
}

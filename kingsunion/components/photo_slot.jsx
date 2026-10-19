// A photo, or a crest placeholder until one is added.
// `aspect` is a Tailwind aspect class, e.g. "aspect-square" or "aspect-[3/2]".
export default function PhotoSlot({
  src,
  alt = "",
  aspect = "aspect-square",
  label = "Photo to come",
  className = "",
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`block w-full ${aspect} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ? `${alt}: ${label.toLowerCase()}` : label}
      className={`w-full ${aspect} bg-[#2a0101] border border-[#d4af37]/40 flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <img src="/KUArmsFinal.png" alt="" className="w-1/3 max-w-32 opacity-20 brightness-0 invert" />
      <span className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );
}

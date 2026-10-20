import PhotoSlot from "@/components/photo_slot";

// Column layouts written out in full so Tailwind keeps them.
const columns = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
};

export default function Gallery({ eyebrow, title, photos }) {
  // No photos yet: leave the section out.
  if (!photos.length) return null;
  const items = photos;
  const cols = items.length >= 3 ? columns[3] : columns[items.length];

  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        {eyebrow && (
          <p className="text-xs sm:text-sm uppercase tracking-widest mb-3 text-[#d4af37]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 sm:mb-8">
          {title}
        </h2>

        <div className={`grid ${cols} gap-3 sm:gap-4`}>
          {items.map((photo, i) => (
            <PhotoSlot
              key={i}
              src={photo.src}
              alt={photo.alt}
              aspect="aspect-[4/3]"
              className="rounded-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// A full-width photo strip between sections. `position` picks which part of
// the photo stays in view when it's cropped (CSS object-position).
export default function PhotoBand({ src, alt, position = "center" }) {
  return (
    <section className="bg-[#2a0101]">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: position }}
        className="block w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] object-cover"
      />
    </section>
  );
}

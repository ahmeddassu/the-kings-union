// A photo. Shows nothing until a photo is added, so the site never shows a
// placeholder. `aspect` is a Tailwind aspect class, e.g. "aspect-square".
export default function PhotoSlot({ src, alt = "", aspect = "aspect-square", className = "" }) {
  if (!src) return null;
  return <img src={src} alt={alt} className={`block w-full ${aspect} object-cover ${className}`} />;
}

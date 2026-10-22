// "The Floor": photos from the chamber, with short captions. Uses the chamber
// gallery (lib/gallery.js); a photo without a caption below is left out.
import { chamberGallery } from "@/lib/gallery";

// Short captions for the photos used here, by file.
const captions = {
  "/gallery/chapel-floor.jpg": "Taking the floor",
  "/gallery/chamber-wide.jpg": "The House sits",
  "/gallery/speaker-and-chair.jpg": "Before the chair",
  "/gallery/audience-listening.jpg": "From the benches",
  "/gallery/floor-question.jpg": "A question from the floor",
  "/gallery/chapel-speaker.jpg": "Making the case",
  "/gallery/after-the-debate-2.jpg": "After the division",
  "/gallery/speaker-reads-statement.jpg": "An opening statement",
  "/gallery/speaker-in-profile.jpg": "Answering the floor",
};

export default function TheFloor() {
  const photos = chamberGallery.filter((p) => captions[p.src]);
  if (photos.length < 3) return null;
  const [lead, ...rest] = photos;

  return (
    <section aria-labelledby="the-floor" className="bg-[#0b0000] text-white font-serif">
      <div className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28">
        <div className="reveal grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-10 sm:mb-14 lg:items-end">
          <div className="lg:col-span-5">
            <p className="title-sc text-base sm:text-lg tracking-[0.12em] text-[#e6c766]">The floor</p>
            <h2 id="the-floor" className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold leading-none">In the chamber.</h2>
          </div>
          <p className="lg:col-span-7 title text-2xl sm:text-3xl md:text-4xl italic leading-tight text-white/85">
            Three speakers a side. Questions from the floor. Then the House divides.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <figure className="col-span-2 row-span-2 flex flex-col">
            <img src={lead.src} alt={lead.alt} loading="lazy" className="warm w-full object-cover aspect-[4/3] lg:aspect-auto lg:min-h-0 lg:flex-1" />
            <figcaption className="mt-2 text-sm sm:text-base italic text-white/70">{captions[lead.src]}</figcaption>
          </figure>
          {rest.map((p) => (
            <figure key={p.src}>
              <img src={p.src} alt={p.alt} loading="lazy" className="warm aspect-[4/3] w-full object-cover" />
              <figcaption className="mt-2 text-sm italic text-white/70">{captions[p.src]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

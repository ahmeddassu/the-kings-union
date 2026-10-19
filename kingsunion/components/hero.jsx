export default function Hero() {
  return (
    <section className="relative w-full aspect-video max-h-[75vh] overflow-hidden bg-black">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero.jpg"
        alt="A King's Union debate in the College Chapel"
      />
    </section>
  );
}

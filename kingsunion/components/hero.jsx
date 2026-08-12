export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="hero.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
    </section>
  );
}
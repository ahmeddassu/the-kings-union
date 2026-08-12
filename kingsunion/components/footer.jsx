export default function Footer() {
  return (
    <footer className="bg-white text-black font-serif border-t border-black">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 sm:gap-10 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">

        <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap">
          the Kings Union
        </span>
        
        <div className="grid grid-cols-2 gap-x-10 sm:gap-x-16 gap-y-2 text-xs sm:text-sm">

          <ul className="flex flex-col gap-2">
            <li>
              <a href="about" className="hover:underline whitespace-nowrap">
                About
              </a>
            </li>

            <li>
              <a href="debates" className="hover:underline whitespace-nowrap">
                Debates
              </a>
            </li>

            <li>
              <a href="term-card" className="hover:underline whitespace-nowrap">
                Term Card
              </a>
            </li>
          </ul>

          <ul className="flex flex-col gap-2">
            <li>
              <a href="social-events" className="hover:underline whitespace-nowrap">
                Events
              </a>
            </li>

            <li>
              <a href="contact" className="hover:underline whitespace-nowrap">
                Join us
              </a>
            </li>

            <li>
              <a href="contact" className="hover:underline whitespace-nowrap">
                Contact us
              </a>
            </li>
          </ul>

        </div>
      </div>
    </footer>
  );
}
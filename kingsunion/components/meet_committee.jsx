const committee = [
  { name: "Mustafa Dassu", title: "Founder & President", image: "/people/mustafa.jpg" },
  { name: "Archie Johnston", title: "Vice President & Treasurer", image: "/people/archie.jpg" },
  { name: "Ethan Khong", title: "Chief of Staff", image: "/people/ethan.jpg" },
  { name: "Ryan Wen", title: "Bursar", image: "/people/ryan.jpg" },
  { name: "Jarren Ong", title: "Legal & Welfare Officer", image: "/people/jarren.jpg" },
  { name: "Isabella Steiner", title: "Communications Officer", image: "/people/isabella.jpg" },
];

export default function MeetTheCommittee() {
  return (
    <section className="bg-white text-black font-serif border-t border-black">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
 <a
          href="#"
          className="inline-block text-xl sm:text-2xl md:text-3xl font-bold tracking-tight hover:underline mb-6 sm:mb-8"
        >
          Meet the Committee
        </a>

        <div className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
          {committee.map((member) => (
            <div
              key={member.name}
              className="flex-none w-32 sm:w-44 md:w-52 snap-start"
            >
              <img
                src={member.image}
                alt=""
                className="w-full aspect-square object-cover mb-3 rounded-lg"
              />
              <p className="text-sm sm:text-base font-bold leading-snug">
                {member.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                {member.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
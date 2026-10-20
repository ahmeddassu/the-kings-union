import { committee } from "@/lib/committee";
import MemberPhoto from "@/components/member_photo";
import ProfileLink from "@/components/profile_link";


export default function MeetTheCommittee() {
  return (
    <section className="bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">

        <a
          href="/governance"
          className="title inline-block py-2 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white hover:text-[#d4af37] mb-4 sm:mb-6 transition-colors duration-200"
        >
          Meet the Committee
        </a>

        <div className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
          {committee.map((member) => (
            <div
              key={member.title}
              className="flex-none w-32 sm:w-44 md:w-52 snap-start"
            >
              <ProfileLink name={member.name}>
                <MemberPhoto member={member} className="mb-3 rounded-lg" />

                <p className={`text-sm sm:text-base font-bold leading-snug group-hover:text-[#d4af37] transition-colors ${member.name ? "text-white" : "text-white/50 italic font-normal"}`}>
                  {member.name || "To be announced"}
                </p>

                <p className="text-xs sm:text-sm text-white/70">
                  {member.title}
                </p>
              </ProfileLink>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
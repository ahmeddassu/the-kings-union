// "Propose a motion" form. Posts to /api/contact, which emails the Union committee.
// Works without JavaScript.
const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white transition-colors";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";

export default function ProposeMotion({ id = "propose" }) {
  const f = (n) => `${id}-${n}`;
  return (
    <section id={id} className="scroll-mt-24 bg-[#3d0202] text-white font-serif border-t border-[#d4af37]">
      <div className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-3">Have your say</p>
          <h2 className="title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">Propose a motion.</h2>
          <p className="mt-4 max-w-md text-base text-white/75 leading-relaxed">
            What should the Union debate next? Suggest a motion and the committee will consider it for
            next term’s card. Name and email are optional.
          </p>
        </div>

        <form action="/api/contact" method="post" className="lg:col-span-7 flex flex-col gap-6">
          <input type="hidden" name="team" value="motion" />

          <div>
            <label htmlFor={f("motion")} className={label}>Your motion *</label>
            <div className="flex items-baseline gap-2 border-b border-[#d4af37]/70 focus-within:border-white">
              <span className="shrink-0 text-base text-white/60 italic">This House</span>
              <input
                id={f("motion")}
                name="motion"
                type="text"
                required
                maxLength={200}
                className="w-full bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none"
                placeholder="would abolish the monarchy"
              />
            </div>
          </div>

          <div>
            <label htmlFor={f("why")} className={label}>Why would it make a good debate?</label>
            <textarea
              id={f("why")}
              name="why"
              rows={3}
              className="w-full mt-2 border border-[#d4af37]/70 bg-transparent p-3 text-base text-white placeholder:text-white/35 outline-none resize-y focus:border-white"
              placeholder="Why now, and who might speak on each side."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor={f("name")} className={label}>Name</label>
              <input id={f("name")} name="name" type="text" autoComplete="name" className={field} placeholder="Optional" />
            </div>
            <div>
              <label htmlFor={f("email")} className={label}>Email</label>
              <input id={f("email")} name="email" type="email" autoComplete="email" className={field} placeholder="Optional" />
            </div>
          </div>

          <label htmlFor={f("speak")} className="flex items-center gap-3 min-h-11 text-base text-white/85 cursor-pointer">
            <input id={f("speak")} name="speak" type="checkbox" value="yes" className="h-5 w-5 accent-[#d4af37]" />
            I’d like to speak in this debate
          </label>

          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor={f("company")}>Company</label>
            <input id={f("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button
            type="submit"
            className="self-stretch sm:self-start min-h-12 bg-[#d4af37] text-[#3d0202] px-7 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
          >
            Submit motion →
          </button>
        </form>
      </div>
    </section>
  );
}

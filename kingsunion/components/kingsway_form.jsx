// The Kingsway writer's application. Works without JavaScript: it posts to
// /api/contact, which emails the Kingsway Editors (and Leadership team, if set).
// The debate and op-ed questions appear once the writer picks one (pure CSS).

const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white transition-colors";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";
const hint = "mt-1 text-sm text-white/50";
const choice =
  "flex-1 min-h-12 flex items-center justify-center border border-[#d4af37] px-4 py-3 text-base cursor-pointer select-none transition-colors has-[:checked]:bg-[#d4af37] has-[:checked]:text-[#3d0202] has-[:checked]:font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-white";

function Choice({ name, value, id, required, children }) {
  return (
    <label htmlFor={id} className={choice}>
      <input id={id} type="radio" name={name} value={value} required={required} className="sr-only" />
      {children}
    </label>
  );
}

export default function KingswayForm({ id = "kingsway" }) {
  const f = (name) => `${id}-${name}`;
  return (
    <form
      id={id}
      action="/api/contact"
      method="post"
      className="group/kw scroll-mt-28 border border-[#d4af37] p-5 sm:p-8 flex flex-col gap-6"
    >
      <input type="hidden" name="team" value="kingsway" />

      <div>
        <p className="text-base uppercase tracking-widest text-[#d4af37] mb-2">
          <em className="normal-case">Kingsway</em>
        </p>
        <h2 className="title text-2xl sm:text-3xl font-bold leading-tight">Write for <em>Kingsway</em>.</h2>
        <p className="mt-2 text-sm text-white/60">
          Seen only by the <em>Kingsway</em> Editors and Senior Leadership Team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor={f("name")} className={label}>Full name *</label>
          <input id={f("name")} name="name" type="text" required autoComplete="name" className={field} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor={f("email")} className={label}>Email *</label>
          <input id={f("email")} name="email" type="email" required autoComplete="email" className={field} placeholder="you@kcl.ac.uk" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor={f("course")} className={label}>Course and year of study *</label>
          <input id={f("course")} name="course" type="text" required className={field} placeholder="e.g. History, Year 2" />
        </div>
        <div>
          <label htmlFor={f("knumber")} className={label}>K number</label>
          <input id={f("knumber")} name="knumber" type="text" autoCapitalize="characters" className={field} placeholder="K1234567" />
          <p className={hint}>Leave blank if you’re not at King’s.</p>
        </div>
      </div>

      <fieldset>
        <legend className={label}>Would you like to write a debate or an op-ed? *</legend>
        <div className="mt-2 flex gap-3">
          <Choice name="kind" value="debate" id={f("kind-debate")} required>Debate</Choice>
          <Choice name="kind" value="oped" id={f("kind-oped")} required>Op-ed</Choice>
        </div>
      </fieldset>

      {/* Debate questions: shown once "Debate" is picked */}
      <div className="hidden group-has-[input[value=debate]:checked]/kw:flex flex-col gap-6">
        <fieldset>
          <legend className={label}>Do you have a partner for your debate?</legend>
          <div className="mt-2 flex gap-3">
            <Choice name="partner" value="Yes" id={f("partner-yes")}>Yes</Choice>
            <Choice name="partner" value="No" id={f("partner-no")}>No</Choice>
          </div>
        </fieldset>
        <div>
          <label htmlFor={f("debate_topic")} className={label}>What topic would you debate?</label>
          <input id={f("debate_topic")} name="debate_topic" type="text" className={field} placeholder="Leave blank if you don’t have one yet" />
        </div>
      </div>

      {/* Op-ed question: shown once "Op-ed" is picked */}
      <div className="hidden group-has-[input[value=oped]:checked]/kw:block">
        <label htmlFor={f("oped_topic")} className={label}>What would your op-ed be about?</label>
        <input id={f("oped_topic")} name="oped_topic" type="text" className={field} placeholder="Your argument, in a line" />
      </div>

      <div>
        <label htmlFor={f("message")} className={label}>Is there anything else our team should know?</label>
        <textarea
          id={f("message")}
          name="message"
          rows={4}
          className="w-full mt-2 border border-[#d4af37]/70 bg-transparent p-3 text-base text-white placeholder:text-white/35 outline-none resize-y focus:border-white transition-colors"
          placeholder="Previous writing, availability, anything at all."
        />
      </div>

      {/* Spam trap: hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={f("company")}>Company</label>
        <input id={f("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        className="self-stretch sm:self-start min-h-12 bg-[#d4af37] text-[#3d0202] px-7 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
      >
        Send application →
      </button>
    </form>
  );
}

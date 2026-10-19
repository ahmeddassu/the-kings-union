// One contact form. Works without JavaScript: it posts to /api/contact,
// which emails the right people and sends the visitor to /contact/sent.

const field =
  "w-full border-b border-[#d4af37]/70 bg-transparent py-3 text-base text-white placeholder:text-white/35 outline-none focus:border-white transition-colors";
const label = "block text-xs uppercase tracking-widest mb-1 text-[#d4af37]";

export default function ContactForm({ id, team, eyebrow, title, note }) {
  const f = (name) => `${id}-${name}`;
  return (
    <form
      id={id}
      action="/api/contact"
      method="post"
      className="scroll-mt-28 border border-[#d4af37] p-5 sm:p-8 flex flex-col gap-6"
    >
      <input type="hidden" name="team" value={team} />

      <div>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-[#d4af37] mb-2">{eyebrow}</p>
        <h2 className="title text-2xl sm:text-3xl font-bold leading-tight">{title}</h2>
        <p className="mt-2 text-sm text-white/60">{note}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor={f("name")} className={label}>Name</label>
          <input id={f("name")} name="name" type="text" required autoComplete="name" className={field} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor={f("email")} className={label}>Email</label>
          <input id={f("email")} name="email" type="email" required autoComplete="email" className={field} placeholder="you@kcl.ac.uk" />
        </div>
      </div>

      <div>
        <label htmlFor={f("subject")} className={label}>Subject</label>
        <input
          id={f("subject")}
          name="subject"
          type="text"
          className={field}
          placeholder={team === "kingsway" ? "Your pitch, in a line" : "What’s this about?"}
        />
      </div>

      <div>
        <label htmlFor={f("message")} className={label}>Message</label>
        <textarea
          id={f("message")}
          name="message"
          rows={6}
          required
          className="w-full mt-2 border border-[#d4af37]/70 bg-transparent p-3 text-base text-white placeholder:text-white/35 outline-none resize-y focus:border-white transition-colors"
          placeholder={team === "kingsway" ? "Tell us the argument, and roughly how long it would be." : "Write your message…"}
        />
      </div>

      {/* Spam trap: hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={f("company")}>Company</label>
        <input id={f("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        className="self-start bg-[#d4af37] text-[#3d0202] px-7 py-3 text-base font-bold hover:bg-white transition-colors duration-200"
      >
        Send message →
      </button>
    </form>
  );
}

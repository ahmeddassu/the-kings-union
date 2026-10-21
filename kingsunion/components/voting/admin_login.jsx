// Admin sign-in form (works without JavaScript).
const messages = {
  wrong: "That email and password don’t match.",
  wait: "Too many attempts. Please wait 15 minutes and try again.",
  setup: "The voting database isn’t connected yet, so admin can’t be used.",
  shared: "The shared password has been switched off. Please sign in with your own email and password.",
};

const field =
  "w-full border border-[#d4af37] bg-transparent px-4 py-3 text-lg text-white placeholder:text-white/40 outline-none focus:border-white";

export default function AdminLogin({ error, shared = true }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <form action="/api/admin/login" method="post" className="w-full max-w-sm text-center">
        <img src="/crest-gold.png" alt="" className="mx-auto h-24 w-auto" />
        <h1 className="title mt-6 text-3xl font-bold">Admin</h1>
        <p className="mt-2 text-white/70">The King’s Union committee</p>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required={!shared} autoFocus placeholder="Email" className={`mt-8 ${field}`} />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Password" className={`mt-3 ${field}`} />
        {shared && <p className="mt-2 text-sm text-white/55">Using the shared committee password? Leave the email blank.</p>}
        {error && messages[error] && (
          <p role="alert" className="mt-3 text-[#f3c4c4]">
            {messages[error]}
          </p>
        )}
        <button type="submit" className="mt-5 w-full min-h-12 bg-[#d4af37] text-[#3d0202] text-lg font-bold hover:bg-white">
          Sign in
        </button>
        <p className="mt-5 text-sm text-white/55">Forgotten your password? Ask the Executive for a new setup link.</p>
      </form>
    </main>
  );
}

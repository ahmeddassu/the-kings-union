// Admin sign-in form (works without JavaScript).
const messages = {
  wrong: "That password isn’t right.",
  wait: "Too many attempts. Please wait 15 minutes and try again.",
  setup: "The voting database isn’t connected yet, so admin can’t be used.",
};

export default function AdminLogin({ error }) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <form action="/api/admin/login" method="post" className="w-full max-w-sm text-center">
        <img src="/crest-gold.png" alt="" className="mx-auto h-24 w-auto" />
        <h1 className="title mt-6 text-3xl font-bold">Admin</h1>
        <p className="mt-2 text-white/70">The King’s Union voting</p>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          className="mt-8 w-full border border-[#d4af37] bg-transparent px-4 py-3 text-lg text-white placeholder:text-white/40 outline-none focus:border-white"
        />
        {error && messages[error] && (
          <p role="alert" className="mt-3 text-[#f3c4c4]">
            {messages[error]}
          </p>
        )}
        <button type="submit" className="mt-5 w-full min-h-12 bg-[#d4af37] text-[#3d0202] text-lg font-bold hover:bg-white">
          Sign in
        </button>
      </form>
    </main>
  );
}

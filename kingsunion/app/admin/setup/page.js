import { setupFor, MIN_PASSWORD } from "@/lib/admin_accounts";
import { teamsOf, teamsLabel } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set your password · Admin" };

const ERRORS = {
  db: "The database isn’t connected.",
  wait: "Too many attempts. Please wait 15 minutes and try again.",
  mismatch: "The two passwords don’t match.",
  short: `Please use at least ${MIN_PASSWORD} characters.`,
  expired: "That link has expired or already been used. Ask the Executive for a new one.",
};

const field =
  "w-full border border-[#d4af37] bg-transparent px-4 py-3 text-lg text-white placeholder:text-white/40 outline-none focus:border-white";

// The page a setup link opens: choose your own password.
export default async function SetupPage({ searchParams }) {
  const q = (await searchParams) || {};
  const person = storeConfigured ? await setupFor(q.token) : null;
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <img src="/crest-gold.png" alt="" className="mx-auto h-24 w-auto" />
        {person ? (
          <form action="/api/admin/setup" method="post">
            <h1 className="title mt-6 text-3xl font-bold">Welcome, {person.name.split(" ")[0]}</h1>
            <p className="mt-2 text-white/70">
              Choose a password for your King’s Union admin login ({teamsLabel(teamsOf(person))}).
            </p>
            <p className="mt-1 text-sm text-white/55 break-all">{person.email}</p>
            <input type="hidden" name="token" value={q.token} />
            <input type="email" name="username" value={person.email} autoComplete="username" readOnly hidden />
            <label htmlFor="password" className="sr-only">New password</label>
            <input id="password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" placeholder="New password" className={`mt-6 ${field}`} />
            <label htmlFor="confirm" className="sr-only">Type it again</label>
            <input id="confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" placeholder="Type it again" className={`mt-3 ${field}`} />
            <p className="mt-2 text-sm text-white/55">At least {MIN_PASSWORD} characters. A few random words works well.</p>
            {ERRORS[q.error] && (
              <p role="alert" className="mt-3 text-[#f3c4c4]">
                {ERRORS[q.error]}
              </p>
            )}
            <button type="submit" className="mt-5 w-full min-h-12 bg-[#d4af37] text-[#3d0202] text-lg font-bold hover:bg-white">
              Save and sign in
            </button>
          </form>
        ) : (
          <>
            <h1 className="title mt-6 text-3xl font-bold">That link doesn’t work</h1>
            <p className="mt-3 text-white/70">It may have expired (links last 7 days) or already been used. Ask the Executive for a new one.</p>
          </>
        )}
      </div>
    </main>
  );
}

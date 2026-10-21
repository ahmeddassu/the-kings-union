import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";
import { fullHealth, ALERT_EMAIL } from "@/lib/health";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status · Admin" };

const h2 = "title text-2xl sm:text-3xl font-bold";
const code = "break-all bg-black/30 px-1.5 py-0.5 font-mono text-sm";

export default async function StatusPage() {
  const base = await requireAdmin("status");
  const health = await fullHealth();
  const time = new Date(health.checkedAt).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <AdminShell base={base} current="/status">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Executive</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Status</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Whether the website, voting and the things they rely on are working. Checked just now, at {time}.{" "}
        <a href={`${base}/status`} className="underline underline-offset-4 hover:text-white">Check again</a>
      </p>

      <p
        role="status"
        className={`mt-8 inline-flex items-center gap-3 border px-4 py-3 text-lg font-bold ${
          health.ok ? "border-[#9fd49f]/60 text-[#bfe6bf]" : "border-[#f3c4c4]/60 text-[#f3c4c4]"
        }`}
      >
        <span aria-hidden="true">{health.ok ? "✓" : "!"}</span>
        {health.ok ? "Everything is working." : "Something needs attention."}
      </p>

      <ul className="mt-6 max-w-3xl">
        {health.items.map((i) => (
          <li key={i.id} className="flex gap-4 border-t border-[#d4af37]/30 py-4">
            <span
              aria-hidden="true"
              className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                i.ok ? "bg-[#9fd49f] text-[#0f2a0f]" : "bg-[#f3c4c4] text-[#3d0202]"
              }`}
            >
              {i.ok ? "✓" : "!"}
            </span>
            <span>
              <strong>{i.label}</strong>
              <span className="sr-only">{i.ok ? ": working." : ": needs attention."}</span>
              <span className="block text-white/70">{i.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      {health.today.length > 0 && (
        <p className="mt-6 max-w-3xl border-l-4 border-[#d4af37] pl-4">
          <strong>On today:</strong> {health.today.map((e) => `${e.title}${e.time ? ` (${e.time})` : ""}`).join(", ")}.
        </p>
      )}

      <section aria-labelledby="alerts-h" className="mt-14 max-w-3xl">
        <h2 id="alerts-h" className={h2}>Alerts</h2>
        <p className="mt-3 text-white/80">
          Every night, after the backup, the website checks itself and emails <strong>{ALERT_EMAIL}</strong> if
          something needs attention. No email means all is well. To send these somewhere else, set{" "}
          <code className={code}>ALERT_EMAIL</code> in Vercel.
        </p>
        <p className="mt-3 text-white/80">
          For an alert within minutes when the site or voting goes down (above all on debate nights), set up a free
          uptime monitor. It checks every five minutes from outside, so it still works when the site itself is down.
        </p>

        <h3 className="title mt-8 text-xl font-bold">Setting up UptimeRobot (about 5 minutes)</h3>
        <ol className="mt-3 list-decimal space-y-3 pl-6 text-white/85">
          <li>
            Sign up at{" "}
            <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              uptimerobot.com
            </a>{" "}
            with the committee’s shared email, on the free plan.
          </li>
          <li>
            Choose <strong>New monitor</strong>, type <strong>HTTP(s)</strong>, and add these three, each checked every
            5 minutes:
            <ul className="mt-2 space-y-1.5 list-disc pl-5">
              <li><code className={code}>https://www.kingsunion.org.uk/api/health</code> (the website)</li>
              <li><code className={code}>https://voting.kingsunion.org.uk/api/health</code> (voting)</li>
              <li><code className={code}>https://admin.kingsunion.org.uk/api/health</code> (admin)</li>
            </ul>
          </li>
          <li>
            Under <strong>Alert contacts</strong>, add the email address of everyone who should hear when something
            goes down. They’ll get an email when it goes down and another when it’s back.
          </li>
          <li>Optional: install the UptimeRobot app on your phone for push alerts.</li>
        </ol>
        <p className="mt-4 text-sm text-white/60">
          Each address answers “ok” when everything works, and an error when the database (votes, forms, logins) is
          down. If the term card sheet can’t be read it still answers “ok” to the monitor, as the site keeps working;
          it shows here and in the nightly email instead. UptimeRobot’s free plan is for non-commercial use, which
          covers a student society.
        </p>
      </section>
    </AdminShell>
  );
}

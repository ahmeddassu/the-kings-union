import AdminShell from "@/components/voting/admin_shell";
import AlertsAdmin from "@/components/voting/alerts_admin";
import AlertMailer from "@/components/voting/alert_mailer";
import { requireAdmin } from "@/lib/admin_page";
import { listAlerts } from "@/lib/inbox";
import { listCampaigns, emailConfigured } from "@/lib/alert_mail";
import { getEvents } from "@/lib/sheet";
import { longDate } from "@/lib/events";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ticket alerts · Admin" };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export default async function AlertsPage() {
  const base = await requireAdmin("alerts");
  const [alerts, campaigns, events] = await Promise.all([listAlerts(), listCampaigns().catch(() => []), getEvents().catch(() => [])]);
  const upcoming = events
    .filter((e) => e.date >= today())
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      type: e.type,
      description: e.description || "",
      when: [longDate(e.date), e.time].filter(Boolean).join(", "),
      venue: e.venue || "",
      tickets: /^https:\/\//.test(e.tickets || "") ? e.tickets : "",
      page: new URL(`/events/${e.slug}`, siteUrl).toString(),
      image: e.photo ? new URL(e.photo, siteUrl).toString() : "",
    }));

  return (
    <AdminShell base={base} current="/alerts">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">From the website</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Ticket alerts</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        {alerts.length} {alerts.length === 1 ? "person has" : "people have"} asked to be emailed when tickets go on sale.
      </p>
      <div className="mt-8">
        <AlertMailer base={base} count={alerts.length} ready={emailConfigured()} events={upcoming} initialCampaigns={campaigns} />
      </div>
      <h2 className="title mt-12 text-2xl font-bold">Everyone on the list</h2>
      <div className="mt-4">
        <AlertsAdmin base={base} initial={alerts} />
      </div>
    </AdminShell>
  );
}

import AdminShell from "@/components/voting/admin_shell";
import FeedbackAdmin from "@/components/voting/feedback_admin";
import { requireAdmin } from "@/lib/admin_page";
import { feedbackSummary, feedbackEmailOn } from "@/lib/feedback";
import { emailConfigured } from "@/lib/alert_mail";
import { listAlerts } from "@/lib/inbox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feedback · Admin" };

export default async function FeedbackPage() {
  const base = await requireAdmin("feedback");
  const [debates, on, alerts] = await Promise.all([feedbackSummary(), feedbackEmailOn(), listAlerts().catch(() => [])]);
  return (
    <AdminShell base={base} current="/feedback">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">After each debate</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Feedback</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Anonymous feedback from the audience: a rating out of 5, what worked, what could be better, and whether they’d
        come again. For the most responses, also paste a debate’s feedback link into Luma’s post-event email, which goes
        to everyone who had a ticket.
      </p>
      <div className="mt-8">
        <FeedbackAdmin base={base} debates={debates} initialOn={on} ready={emailConfigured()} listSize={alerts.length} />
      </div>
    </AdminShell>
  );
}

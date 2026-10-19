import AdminShell from "@/components/voting/admin_shell";
import DebateForm from "@/components/voting/debate_form";
import { requireAdmin, yesterdayInLondon } from "@/lib/admin_page";
import { getEvents } from "@/lib/sheet";

export const dynamic = "force-dynamic";

export default async function NewDebate() {
  const base = await requireAdmin();
  const yesterday = yesterdayInLondon();
  const termCard = (await getEvents())
    .filter((e) => e.type === "Debate" && e.date >= yesterday)
    .map(({ slug, title, date, time, venue, proposition, opposition }) => ({ slug, title, date, time, venue, proposition, opposition }));

  return (
    <AdminShell base={base}>
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">New debate</p>
      <h1 className="title mt-2 mb-8 text-4xl sm:text-5xl font-bold">Add a debate</h1>
      <DebateForm base={base} termCard={termCard} />
    </AdminShell>
  );
}

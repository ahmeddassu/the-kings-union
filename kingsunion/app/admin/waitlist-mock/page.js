// MOCK-UP ONLY (not shipped): what the committee's waitlist view would look like.
import AdminShell from "@/components/voting/admin_shell";
import { requireAdmin } from "@/lib/admin_page";

const sans = "[font-family:ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif]";
const rows = [
  [1, "Priya Patel", "pr•••12@kcl.ac.uk", "Thu 22 Oct, 18:04", 5, "Claimed", "Claimed 19:12"],
  [2, "Omar Khan", "om•••07@kcl.ac.uk", "Thu 22 Oct, 18:10", 0, "Claimed", "Claimed 19:40"],
  [3, "Grace Reid", "gr•••33@kcl.ac.uk", "Thu 22 Oct, 18:31", 2, "Expired", "Didn’t claim in time"],
  [4, "Jamal Okafor", "ja•••41@kcl.ac.uk", "Thu 22 Oct, 19:02", 4, "Offered", "Offered 16:55 · expires 18:55"],
  [5, "Isla Turner", "is•••19@gmail.com", "Thu 22 Oct, 20:15", 0, "Offered", "Offered 16:55 · expires 18:55"],
  [6, "Femi Mensah", "fe•••58@kcl.ac.uk", "Fri 23 Oct, 09:47", 1, "Waiting", ""],
  [7, "Leah Novak", "le•••02@kcl.ac.uk", "Fri 23 Oct, 11:20", 0, "Waiting", ""],
  [8, "Max Shah", "ma•••90@kcl.ac.uk", "Fri 23 Oct, 13:05", 6, "Waiting", ""],
  [9, "Nadia Hart", "na•••27@kcl.ac.uk", "Fri 23 Oct, 16:48", 0, "Waiting", ""],
];
const tone = { Claimed: "bg-[#c7e6c2] text-[#123d12]", Expired: "bg-white/15 text-white/80", Offered: "bg-[#c9daf4] text-[#0f2547]", Waiting: "border border-white/40 text-white" };

export default async function WaitlistMock() {
  const base = await requireAdmin("attendance");
  return (
    <AdminShell base={base} current="/attendance" wide>
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Mock-up</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Waitlists</h1>
      <div className={`mt-6 ${sans}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="text-sm">
            <span className="block text-xs font-semibold uppercase tracking-wider text-white/60">Debate</span>
            <select className="mt-1 h-10 rounded-sm border border-white/25 bg-[#1f0101] px-2 text-white"><option>This House believes religion is the opium of the masses · Tue 27 Oct</option></select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="h-10 rounded-sm bg-[#d4af37] px-4 text-sm font-semibold text-[#2a0101]">Offer next tickets…</button>
            <button className="h-10 rounded-sm border border-white/25 px-4 text-sm font-semibold">Download</button>
            <button className="h-10 rounded-sm border border-white/25 px-4 text-sm font-semibold">Close waitlist</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["Waiting", 4], ["Offered now", 2], ["Claimed", 2], ["Regulars waiting", 2]].map(([l, n]) => (
            <div key={l} className="rounded-sm border border-white/15 bg-[#2a0101] px-3 py-2"><span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">{l}</span><span className="text-2xl font-bold">{n}</span></div>
          ))}
        </div>
        <p className="mt-3 text-sm text-white/70">Each offer emails a link to claim a ticket on Luma; if it isn’t claimed within 2 hours it goes to the next person automatically. Regulars can be moved up with “Prioritise regulars”.</p>
        <div className="mt-3 overflow-x-auto rounded-sm border border-white/15">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-[#2a0101] text-left text-xs uppercase tracking-wider text-white/60"><tr>{["#", "Name", "Email", "Joined", "Been to", "Status", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(([n, name, email, joined, visits, st, note]) => (
                <tr key={n} className="border-t border-white/10">
                  <td className="px-3 py-2 tabular-nums text-white/60">{n}</td>
                  <td className="px-3 py-2 font-semibold">{name}{visits >= 3 && <span className="ml-2 rounded-full bg-[#d4af37] px-1.5 text-[11px] font-bold text-[#2a0101]">Regular</span>}</td>
                  <td className="px-3 py-2 text-white/75">{email}</td>
                  <td className="px-3 py-2 text-white/75">{joined}</td>
                  <td className="px-3 py-2 tabular-nums text-white/75">{visits ? `${visits} debates` : "First time"}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone[st]}`}>{st}</span> <span className="ml-1 text-xs text-white/60">{note}</span></td>
                  <td className="px-3 py-2 text-right text-xs font-semibold text-white/70">{st === "Waiting" ? "Offer now" : st === "Offered" ? "Cancel offer" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

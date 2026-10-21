import AdminShell from "@/components/voting/admin_shell";
import PeopleAdmin from "@/components/voting/people_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listPeople } from "@/lib/admin_accounts";
import { sharedAllowed, TEAMS, SECTIONS, getAdmin } from "@/lib/admin_auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "People · Admin" };

export default async function PeoplePage() {
  const base = await requireAdmin("people");
  const [people, shared, me] = await Promise.all([listPeople(), sharedAllowed(), getAdmin()]);
  // What each team can see, in plain words, for the key on this page.
  const teams = Object.entries(TEAMS).map(([key, t]) => ({
    key,
    label: t.label,
    sees: key === "super" ? ["Everything the Executive sees, plus the Activity log. Set in Vercel, not here"] : key === "executive" ? ["Everything (People, Backups…) except the Activity log"] : [...new Set(t.can.map((s) => (s === "messages" ? "Messages to the Union" : s === "kingsway" ? "Kingsway writer applications" : SECTIONS[s].label)))],
  }));
  return (
    <AdminShell base={base} current="/people">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Executive and super admins</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">People</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Everyone on the committee gets their own login, and each team only sees its own parts of admin. When someone
        leaves, turn their login off. Everything people do is recorded in the Activity log, which only super admins can see.
      </p>
      <div className="mt-8">
        <PeopleAdmin base={base} initial={people} shared={shared} teams={teams} meId={me?.id} meIsSuper={me?.team === "super"} />
      </div>
    </AdminShell>
  );
}

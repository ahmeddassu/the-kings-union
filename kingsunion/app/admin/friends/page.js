import AdminShell from "@/components/voting/admin_shell";
import FriendsAdmin from "@/components/voting/friends_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listFriends } from "@/lib/friends";

export const dynamic = "force-dynamic";
export const metadata = { title: "Friends of the Union · Admin" };

export default async function FriendsPage() {
  const base = await requireAdmin("friends");
  const friends = await listFriends();
  return (
    <AdminShell base={base} current="/friends">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">Alumni and supporters</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Friends of the Union</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        People who signed up at <a href="https://www.kingsunion.org.uk/friends" className="underline underline-offset-4">kingsunion.org.uk/friends</a> to
        stay in touch. They agreed to hear from the Union by email. If someone asks to be removed, delete them here.
      </p>
      <div className="mt-8">
        <FriendsAdmin base={base} initial={friends} />
      </div>
    </AdminShell>
  );
}

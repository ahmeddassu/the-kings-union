import AdminShell from "@/components/voting/admin_shell";
import MessagesAdmin from "@/components/voting/messages_admin";
import { requireAdmin } from "@/lib/admin_page";
import { listMessages } from "@/lib/inbox";
import { getAdmin } from "@/lib/admin_auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages · Admin" };

export default async function MessagesPage() {
  const base = await requireAdmin(["messages", "kingsway"]);
  const admin = await getAdmin();
  // Each team sees only its own inbox (the Executive sees both).
  const initial = {};
  if (admin.can("messages")) initial.union = await listMessages("union");
  if (admin.can("kingsway")) initial.kingsway = await listMessages("kingsway");
  return (
    <AdminShell base={base} current="/messages">
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">From the website</p>
      <h1 className="title mt-2 text-4xl sm:text-5xl font-bold">Messages</h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Everything sent through the Contact page: messages to the Union and Kingsway writer applications. Reply
        by email, then mark it dealt with.
      </p>
      <div className="mt-8">
        <MessagesAdmin base={base} initial={initial} />
      </div>
    </AdminShell>
  );
}

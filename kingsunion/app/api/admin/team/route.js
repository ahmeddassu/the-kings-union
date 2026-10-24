// The team directory (admin → Dashboard).
//   POST { action: "save", member }   add (no id) or change someone. The
//        Executive can change anyone; others only their own WhatsApp and email.
//   POST { action: "delete", id }     remove someone (Executive)
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import { rowsFor } from "@/lib/dashboard";
import { isExec } from "@/lib/tasks";
import { saveMember, removeMember, listTeam } from "@/lib/team";

export const dynamic = "force-dynamic";

const bad = (error, status = 400) => Response.json({ error }, { status });

export async function POST(request) {
  const admin = await can("dashboard");
  if (!admin) return refuse();
  const body = await request.json().catch(() => ({}));
  const exec = isExec(admin);

  try {
    if (body.action === "delete") {
      if (!exec) return bad("Only the Executive can remove people.", 403);
      const gone = await removeMember(body.id);
      if (gone) await logAction(admin, `Removed ${gone.name} from the team directory`);
      return Response.json({ ok: true });
    }
    if (body.action === "save") {
      const input = body.member || {};
      if (exec) {
        const { before, member } = await saveMember(input, admin);
        await logAction(admin, before ? `Updated ${member.name} in the team directory` : `Added ${member.name} to the team directory`);
        return Response.json({ member });
      }
      const mine = rowsFor(admin, await listTeam()).map((p) => p.id);
      if (!input.id || !mine.includes(input.id)) return bad("You can only change your own details.", 403);
      const { member } = await saveMember(input, admin, { contactOnly: true });
      await logAction(admin, `Updated their own contact details`);
      return Response.json({ member });
    }
  } catch (err) {
    return bad(err?.message || "That couldn’t be saved.");
  }
  return bad("Unknown action.");
}

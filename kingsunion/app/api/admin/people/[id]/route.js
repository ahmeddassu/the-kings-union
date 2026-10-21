// Executive: change someone's team ({ team }), turn their login off or on
// ({ disabled }), give them a new setup link ({ resetPassword: true }), or remove them.
import { can, refuse, sharedAllowed, TEAMS } from "@/lib/admin_auth";
import { updatePerson, removePerson, listPeople } from "@/lib/admin_accounts";
import { setupLink, emailSetupLink } from "@/lib/setup_link";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
const missing = () => Response.json({ error: "That person no longer has a login." }, { status: 404 });

export async function PATCH(request, { params }) {
  const admin = await can("people");
  if (!admin) return refuse();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const result = await updatePerson(id, body, await sharedAllowed());
    if (!result) return missing();
    const { person, token } = result;
    let link = null, emailed = false;
    if (token) {
      link = setupLink(request, token);
      emailed = await emailSetupLink(person, link, true);
      await logAction(admin, `Made a new setup link for ${person.name}`);
    }
    if (body.team !== undefined) await logAction(admin, `Moved ${person.name} to ${TEAMS[person.team].label}`);
    if (body.disabled !== undefined) await logAction(admin, `${body.disabled ? "Turned off" : "Turned back on"} ${person.name}’s login`);
    return Response.json({ person, link, emailed });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await can("people");
  if (!admin) return refuse();
  const { id } = await params;
  try {
    const who = (await listPeople()).find((p) => p.id === id);
    if (!(await removePerson(id, await sharedAllowed()))) return missing();
    await logAction(admin, `Removed ${who?.name || "a person"}’s login`);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

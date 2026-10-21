// Executive: committee logins. GET lists them; POST adds someone
// ({ action: "add", name, email, team }) or switches the shared password
// on or off ({ action: "shared", on }).
import { can, refuse, sharedAllowed, TEAMS } from "@/lib/admin_auth";
import { listPeople, addPerson, setShared } from "@/lib/admin_accounts";
import { setupLink, emailSetupLink } from "@/lib/setup_link";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await can("people");
  if (!admin) return refuse();
  return Response.json({ people: await listPeople(), shared: await sharedAllowed() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const admin = await can("people");
  if (!admin) return refuse();
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "add") {
      const { person, token } = await addPerson(body);
      const link = setupLink(request, token);
      const emailed = await emailSetupLink(person, link);
      await logAction(admin, `Gave ${person.name} a login (${TEAMS[person.team].label})`);
      return Response.json({ person, link, emailed });
    }
    if (body.action === "shared") {
      await setShared(Boolean(body.on));
      await logAction(admin, `Switched the shared committee password ${body.on ? "on" : "off"}`);
      return Response.json({ shared: Boolean(body.on) });
    }
    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

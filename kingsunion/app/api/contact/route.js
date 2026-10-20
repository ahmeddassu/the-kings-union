// Receives the Union contact form, the Kingsway writer's application, motion
// suggestions and ticket-alert sign-ups.
//
// Every submission is saved in the voting database and can be read in the
// admin site (Messages, Kingsway applications, Ticket alerts), so nothing is
// lost. If email is set up, a copy is also emailed. To set up email, add these
// in Vercel (Settings → Environment Variables), then redeploy:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  – the mailbox that sends the emails
//   (for Gmail: smtp.gmail.com, 465, the address, and an app password)
import nodemailer from "nodemailer";
import { teams } from "@/lib/contact";
import { clientIp } from "@/lib/admin_auth";
import { storeConfigured } from "@/lib/store";
import { allowSubmission, addMotion } from "@/lib/submissions";
import { saveMessage, addAlert } from "@/lib/inbox";

export const dynamic = "force-dynamic";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function back(request, path) {
  return Response.redirect(new URL(path, request.url), 303);
}

const failed = (team) =>
  ({ motion: `/motions?error=send#suggest`, alerts: `/?error=send#mailing-list` })[team] || `/contact?error=send#${team}`;

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  if (!form) return back(request, "/contact?error=missing");
  const team = teams[clean(form.get("team"), 20)] ? clean(form.get("team"), 20) : "union";

  // Spam trap: real people never see or fill this field.
  if (clean(form.get("company"), 200)) return back(request, `/contact/sent?team=${team}`);

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 200);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let subject, message, save;

  if (team === "alerts") {
    if (!validEmail) return back(request, `/?error=email#mailing-list`);
    subject = `Ticket alerts sign-up: ${email}`;
    message = ["Please add this address to the ticket alerts list:", "", email, name ? `Name: ${name}` : null]
      .filter((l) => l !== null)
      .join("\n");
    save = () => addAlert(email, name);
  } else if (team === "motion") {
    // Older form address: motions now go to /api/motions, but keep this working.
    const motion = clean(form.get("motion"), 200).replace(/^this house\s*/i, "");
    if (!motion) return back(request, `/motions?error=missing#suggest`);
    subject = `This House ${motion}`;
    message = `Motion: This House ${motion}\n\n${clean(form.get("why"), 3000) || "—"}`;
    save = () =>
      addMotion({ motion, why: form.get("why"), name, email, speak: form.get("speak") === "yes" });
  } else if (team === "kingsway") {
    const course = clean(form.get("course"), 200);
    const rawKind = clean(form.get("kind"), 10);
    const kind = rawKind === "oped" ? "Op-ed" : rawKind === "debate" ? "Debate" : "";
    if (!name || !validEmail || !course || !kind) {
      return back(request, `/contact?error=missing#${team}`);
    }
    const fields = {
      name,
      email,
      course,
      knumber: clean(form.get("knumber"), 20),
      kind,
      partner: kind === "Debate" ? clean(form.get("partner"), 5) : "",
      topic: kind === "Debate" ? clean(form.get("debate_topic"), 500) : clean(form.get("oped_topic"), 500),
      message: clean(form.get("message"), 5000),
    };
    const lines = [
      `Full name: ${name}`,
      `Email: ${email}`,
      `Course and year: ${course}`,
      `K number: ${fields.knumber || "—"}`,
      `Wants to write: ${kind}`,
    ];
    if (kind === "Debate") {
      lines.push(`Has a debate partner: ${fields.partner || "—"}`);
      lines.push(`Debate topic: ${fields.topic || "N/A"}`);
    } else {
      lines.push(`Op-ed topic: ${fields.topic || "—"}`);
    }
    lines.push("", "Anything else:", fields.message || "—");
    subject = `Writer application (${kind}): ${name}`;
    message = lines.join("\n");
    save = () => saveMessage("kingsway", fields);
  } else {
    subject = clean(form.get("subject"), 200) || "Message from the website";
    message = clean(form.get("message"), 5000);
    if (!name || !validEmail || !message) {
      return back(request, `/contact?error=missing#${team}`);
    }
    save = () => saveMessage("union", { name, email, subject, message });
  }

  // 1. Save it (the reliable copy).
  let saved = false;
  if (storeConfigured) {
    try {
      if (!(await allowSubmission(`form-${team}`, clientIp(request)))) {
        return back(request, team === "alerts" ? `/?error=busy#mailing-list` : `/contact?error=busy#${team}`);
      }
      await save();
      saved = true;
    } catch (err) {
      console.error("Couldn't save form submission:", err);
    }
  }

  // 2. Email a copy, if email is set up.
  let emailed = false;
  // (Motions email their own copy when they're saved.)
  if (emailConfigured() && !(team === "motion" && saved)) {
    try {
      const port = Number(process.env.SMTP_PORT || 465);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: `"King’s Union website" <${process.env.SMTP_USER}>`,
        to: teams[team].recipients(),
        replyTo: validEmail ? `"${name.replace(/"/g, "")}" <${email}>` : undefined,
        subject: `[${teams[team].label}] ${subject}`,
        text: `${message}\n\n—\nFrom: ${name || "Anonymous"}${validEmail ? ` <${email}>` : ""}\nSent via the ${teams[team].label} form on kingsunion.org.uk${saved ? "\nAlso saved in admin.kingsunion.org.uk" : ""}`,
      });
      emailed = true;
    } catch (err) {
      console.error("Contact form failed to send:", err);
    }
  }

  if (!saved && !emailed) return back(request, failed(team));
  return back(request, team === "motion" ? `/motions?sent=1#suggest` : `/contact/sent?team=${team}`);
}

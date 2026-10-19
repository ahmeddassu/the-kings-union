// Receives the Union contact form, the Kingsway writer's application and motion suggestions, and emails them on.
// Needs these settings in Vercel (Settings → Environment Variables):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  – the mailbox that sends the emails
//   (for Gmail: smtp.gmail.com, 465, the address, and an app password)
import nodemailer from "nodemailer";
import { teams } from "@/lib/contact";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

function back(request, path) {
  return Response.redirect(new URL(path, request.url), 303);
}

export async function POST(request) {
  const form = await request.formData();
  const team = teams[clean(form.get("team"), 20)] ? clean(form.get("team"), 20) : "union";

  // Spam trap: real people never see or fill this field.
  if (clean(form.get("company"), 200)) return back(request, `/contact/sent?team=${team}`);

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 200);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let subject, message;

  if (team === "motion") {
    // Motion suggestion: only the motion is required.
    const motion = clean(form.get("motion"), 200).replace(/^this house\s*/i, "");
    if (!motion) return back(request, `/debates?error=missing#propose`);
    subject = `This House ${motion}`;
    message = [
      `Motion: This House ${motion}`,
      "",
      "Why it would make a good debate:",
      clean(form.get("why"), 3000) || "—",
      "",
      `Wants to speak: ${form.get("speak") === "yes" ? "Yes" : "No"}`,
      `Name: ${name || "—"}`,
      `Email: ${validEmail ? email : "—"}`,
    ].join("\n");
  } else if (team === "kingsway") {
    // Kingsway writer's application
    const course = clean(form.get("course"), 200);
    const kind = clean(form.get("kind"), 10) === "oped" ? "Op-ed" : clean(form.get("kind"), 10) === "debate" ? "Debate" : "";
    if (!name || !validEmail || !course || !kind) {
      return back(request, `/contact?error=missing#${team}`);
    }
    const lines = [
      `Full name: ${name}`,
      `Email: ${email}`,
      `Course and year: ${course}`,
      `K number: ${clean(form.get("knumber"), 20) || "—"}`,
      `Wants to write: ${kind}`,
    ];
    if (kind === "Debate") {
      lines.push(`Has a debate partner: ${clean(form.get("partner"), 5) || "—"}`);
      lines.push(`Debate topic: ${clean(form.get("debate_topic"), 500) || "N/A"}`);
    } else {
      lines.push(`Op-ed topic: ${clean(form.get("oped_topic"), 500) || "—"}`);
    }
    lines.push("", "Anything else:", clean(form.get("message"), 5000) || "—");
    subject = `Writer application (${kind}): ${name}`;
    message = lines.join("\n");
  } else {
    subject = clean(form.get("subject"), 200) || "Message from the website";
    message = clean(form.get("message"), 5000);
    if (!name || !validEmail || !message) {
      return back(request, `/contact?error=missing#${team}`);
    }
  }

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
      text: `${message}\n\n—\nFrom: ${name || "Anonymous"}${validEmail ? ` <${email}>` : ""}\nSent via the ${teams[team].label} contact form on kingsunion.org.uk`,
    });
  } catch (err) {
    console.error("Contact form failed to send:", err);
    return back(request, team === "motion" ? `/debates?error=send#propose` : `/contact?error=send#${team}`);
  }

  return back(request, `/contact/sent?team=${team}`);
}

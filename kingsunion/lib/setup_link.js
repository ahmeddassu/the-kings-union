// The setup link for a new committee member (or a password reset), on the
// admin address the Executive is using, and an email with it if email is set up.
import nodemailer from "nodemailer";
import { teamsOf, teamsLabel } from "@/lib/admin_auth";

export function setupLink(request, token) {
  const url = new URL(request.url);
  const host = (request.headers.get("host") || url.host).toLowerCase();
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const path = host.startsWith("admin.") ? "/setup" : "/admin/setup";
  return `${proto}://${host}${path}?token=${token}`;
}

// Returns true if the email was sent.
export async function emailSetupLink(person, link, reset = false) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    await nodemailer
      .createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      .sendMail({
        from: `"King’s Union admin" <${process.env.SMTP_USER}>`,
        to: person.email,
        subject: reset ? "Reset your King’s Union admin password" : "Your King’s Union admin login",
        text: [
          `Hi ${person.name.split(" ")[0]},`,
          "",
          reset
            ? "Here’s a link to choose a new password for your King’s Union admin login:"
            : `You’ve been given a King’s Union admin login (${teamsLabel(teamsOf(person))}). Choose your password here:`,
          "",
          link,
          "",
          "The link works once and expires in 7 days. If you weren’t expecting this, you can ignore it.",
        ].join("\n"),
      });
    return true;
  } catch (err) {
    console.error("Couldn't email setup link:", err);
    return false;
  }
}

import { sgMail } from "../config/mailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

// Wraps email sending in try/catch so a failed send never breaks the
// calling operation (e.g. a status update should still succeed even if
// the notification email fails to go out). Failures are logged, not thrown.
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || "pranavchaudhari499@gmail.com", // This MUST match your verified Sender Identity
      subject,
      html,
    };
    
    await sgMail.send(msg);
    return true;
  } catch (err: any) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err.response?.body || err);
    return false;
  }
}
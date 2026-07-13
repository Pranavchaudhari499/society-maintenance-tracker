import { transporter } from "../config/mailer";

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
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        return true;
    } catch (err) {
        console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
        return false;
    }
}
import nodemailer from "nodemailer";

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendMail(to: string, subject: string, text: string) {
  if (!transport) {
    console.log(`[mail disabled] to=${to} subject=${subject}`);
    return;
  }
  await transport
    .sendMail({ from: process.env.MAIL_FROM, to, subject, text })
    .catch((e) => console.error("mail error", e));
}

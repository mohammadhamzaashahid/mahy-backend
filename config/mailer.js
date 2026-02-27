import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail({ to, name, otp }) {
  const fromName = process.env.MAIL_FROM_NAME;
  const fromEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  const subject = "Your verification code (OTP)";
  const text = `Hi ${name || ""}\n\nYour OTP is: ${otp}\nIt expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.\n\nIf you didn't request this, ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Email Verification</h2>
      <p>Hi ${name || ""},</p>
      <p>Your OTP is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</div>
      <p>This code expires in <b>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</b>.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}
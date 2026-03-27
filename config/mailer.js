import { sendGraphEmail } from "./graphMailer.js";


export async function sendOtpEmail({ to, name, otp }) {
  const subject = "Your verification code (OTP)";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Email Verification</h2>
      <p>Hi ${name || ""},</p>
      <p>Your OTP is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</div>
      <p>This code expires in <b>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</b>.</p>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `;

  await sendGraphEmail({
    to,
    subject,
    html,
  });
}

export async function sendDecisionEmail({
  to,
  name,
  referenceNo,
  status,
  decisionRemarks,
  downloadUrl,
}) {
  const subject =
    status === "APPROVED"
      ? `Document Approved - ${referenceNo}`
      : `Document Rejected - ${referenceNo}`;

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.6">

    <h2>Document ${status}</h2>

    <p>Dear ${name || "User"},</p>

    <p>
      Your document with reference <b>${referenceNo}</b>
      has been <b>${status}</b>.
    </p>

    <p>
      <b>Remarks:</b><br/>
      ${decisionRemarks || "No remarks provided"}
    </p>

    ${
      status === "APPROVED"
        ? `
      <p>The approved document is available below:</p>
      <a href="${downloadUrl}" style="
        background:#000;
        color:#fff;
        padding:10px 16px;
        text-decoration:none;
        border-radius:4px;
      ">
        Download Approved Document
      </a>
      `
        : `
      <p>Please review the remarks and upload a corrected document if required.</p>
      `
    }

    <p style="margin-top:30px">
      Regards,<br/>
      MAHY Portal
    </p>

  </div>
  `;

  await sendGraphEmail({
    to,
    subject,
    html,
  });
}




















































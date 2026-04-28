import { sendGraphEmail } from "../config/graphMailer.js";

const TO_EMAIL = "Akherash@mahykhoory.com";

export const sendContactEmail = async (data) => {
  const {
    firstName,
    lastName,
    companyName,
    companyWebsite,
    businessEmail,
    mobileNumber,
    country,
    enquiryType,
    message,
  } = data;

  const subject = `New Contact Enquiry - ${enquiryType}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      
      <h2 style="margin-bottom: 10px;">New Contact Enquiry</h2>
      <p style="color: #555;">A new enquiry has been submitted from the website.</p>

      <hr style="margin: 20px 0;" />

      <h3>Contact Details</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Full Name:</td>
          <td style="padding: 8px;">${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Email:</td>
          <td style="padding: 8px;">${businessEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Phone:</td>
          <td style="padding: 8px;">${mobileNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Country:</td>
          <td style="padding: 8px;">${country}</td>
        </tr>
      </table>

      <h3 style="margin-top: 20px;">Company Details</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Company Name:</td>
          <td style="padding: 8px;">${companyName || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Website:</td>
          <td style="padding: 8px;">
            ${
              companyWebsite
                ? `<a href="${companyWebsite}" target="_blank">${companyWebsite}</a>`
                : "-"
            }
          </td>
        </tr>
      </table>

      <h3 style="margin-top: 20px;">Enquiry Details</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Type:</td>
          <td style="padding: 8px;">${enquiryType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Message:</td>
          <td style="padding: 8px;">${message || "-"}</td>
        </tr>
      </table>

      <hr style="margin: 20px 0;" />

      <p style="font-size: 12px; color: #888;">
        This email was automatically generated from the website contact form.
      </p>

    </div>
  `;

  await sendGraphEmail({
    to: TO_EMAIL,
    subject,
    html,
  });
};
import fetch from "node-fetch";
import { getGraphAccessToken } from "../middlewares/getGraphAccessToken.js";


const FROM_EMAIL = process.env.MAIL_FROM_EMAIL; 

console.log(FROM_EMAIL);


export const sendGraphEmail = async ({ to, subject, html }) => {
  const token = await getGraphAccessToken();

  const url = `https://graph.microsoft.com/v1.0/users/${FROM_EMAIL}/sendMail`;

  const payload = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: html,
      },
      toRecipients: Array.isArray(to)
        ? to.map((email) => ({
            emailAddress: { address: email },
          }))
        : [
            {
              emailAddress: { address: to },
            },
          ],
    },
    saveToSentItems: true,
  };
console.log(payload);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  

  if (!response.ok) {
    const text = await response.text();
    console.error("Graph Mail Error:", text);
    throw new Error(`Graph mail failed: ${text}`);
  }

  return true;
};
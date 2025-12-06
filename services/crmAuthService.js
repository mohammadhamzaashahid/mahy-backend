import axios from "axios";
import AuthToken from "../models/AuthToken.js";

export async function getCRMToken() {
  let existing = await AuthToken.findOne();

  if (existing && existing.expiresOn > Date.now() + 300000) {
    return existing.token;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.CRM_CLIENT_ID);
  params.append("client_secret", process.env.CRM_CLIENT_SECRET);
  params.append("resource", process.env.CRM_RESOURCE);

  const { data } = await axios.post(
    `https://login.microsoftonline.com/${process.env.CRM_TENANT_ID}/oauth2/token`,
    params
  );

  const expiry = Date.now() + data.expires_in * 1000;

  await AuthToken.deleteMany();
  await AuthToken.create({ token: data.access_token, expiresOn: expiry });

  return data.access_token;
}

import axios from "axios";
import AuthToken from "../models/AuthToken.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

let memoryToken = null;
let memoryExpiry = 0;
let refreshPromise = null;

async function fetchNewTokenFromAAD() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.CRM_CLIENT_ID);
  params.append("client_secret", process.env.CRM_CLIENT_SECRET);
  params.append("resource", process.env.CRM_RESOURCE);

  const { data } = await axios.post(
    `https://login.microsoftonline.com/${process.env.CRM_TENANT_ID}/oauth2/token`,
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const expiresOn = Date.now() + Number(data.expires_in) * 1000;

  await AuthToken.deleteMany({});
  await AuthToken.create({ token: data.access_token, expiresOn });

  
  memoryToken = data.access_token;
  memoryExpiry = expiresOn;

  return data.access_token;
}

export async function getCRMToken() {
  if (memoryToken && memoryExpiry > Date.now() + REFRESH_BUFFER_MS) {
    return memoryToken;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const existing = await AuthToken.findOne().lean();
      if (existing?.token && existing.expiresOn > Date.now() + REFRESH_BUFFER_MS) {
        memoryToken = existing.token;
        memoryExpiry = existing.expiresOn;
        return existing.token;
      }

      return await fetchNewTokenFromAAD();
    } finally {
      refreshPromise = null; 
    }
  })();

  return refreshPromise;
}

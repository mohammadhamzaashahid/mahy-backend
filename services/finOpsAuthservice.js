import axios from "axios";
import FinOpsToken from "../models/FinOpsToken.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

let memoryToken = null;
let memoryExpiry = 0;
let refreshPromise = null;

async function fetchNewFinOpsToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", process.env.FO_CLIENT_ID);
  params.append("client_secret", process.env.FO_CLIENT_SECRET);
  params.append("resource", process.env.FO_RESOURCE); 
  const { data } = await axios.post(
    `https://login.microsoftonline.com/${process.env.FO_TENANT_ID}/oauth2/token`,
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const expiresOn = Date.now() + Number(data.expires_in) * 1000;

  await FinOpsToken.deleteMany({});
  await FinOpsToken.create({
    token: data.access_token,
    expiresOn,
  });

  memoryToken = data.access_token;
  memoryExpiry = expiresOn;

  return data.access_token;
}

export async function getFinOpsToken() {
  if (memoryToken && memoryExpiry > Date.now() + REFRESH_BUFFER_MS) {
    return memoryToken;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const existing = await FinOpsToken.findOne().lean();

      if (
        existing?.token &&
        existing.expiresOn > Date.now() + REFRESH_BUFFER_MS
      ) {
        memoryToken = existing.token;
        memoryExpiry = existing.expiresOn;
        return existing.token;
      }

      return await fetchNewFinOpsToken();
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
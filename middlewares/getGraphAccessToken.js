import fetch from "node-fetch";
import { getPool } from "../config/mysql.js";

let cachedToken = null;
let tokenExpiry = null;
let refreshInFlight = null;

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

const isExpiringSoon = (expiresAt) => {
  if (!expiresAt) return true;
  return expiresAt.getTime() - Date.now() <= REFRESH_BUFFER_MS;
};

const resolveExpiry = (data) => {
  const now = Date.now();
  return new Date(now + (data.expires_in || 3600) * 1000);
};

const fetchAndPersistToken = async (pool) => {
  const url = `https://login.microsoftonline.com/${process.env.MAHY_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: process.env.MAHY_CLIENT_ID,
    client_secret: process.env.MAHY_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(url, {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Graph token error: ${text}`);
  }

  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiry = resolveExpiry(data);

  await pool.query("DELETE FROM GraphTokenCache");
  await pool.query(
    "INSERT INTO GraphTokenCache (AccessToken, ExpiresOn) VALUES (?, ?)",
    [cachedToken, tokenExpiry]
  );

  console.log(`Graph token refreshed. Expiry: ${tokenExpiry.toISOString()}`);

  return cachedToken;
};

const ensureFreshToken = async (pool) => {
  if (!refreshInFlight) {
    refreshInFlight = fetchAndPersistToken(pool).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

export const getGraphAccessToken = async (forceRefresh = false) => {
  const pool = await getPool();
  if (!forceRefresh && cachedToken && tokenExpiry && !isExpiringSoon(tokenExpiry)) {
    return cachedToken;
  }

  if (refreshInFlight) return refreshInFlight;

  const [rows] = await pool.query(`
    SELECT AccessToken, ExpiresOn
    FROM GraphTokenCache
    WHERE ExpiresOn > DATE_ADD(UTC_TIMESTAMP(), INTERVAL 300 SECOND)
    ORDER BY Id DESC LIMIT 1
  `);

  if (!forceRefresh && rows.length) {
    const dbToken = rows[0].AccessToken;
    const dbExpiry = new Date(rows[0].ExpiresOn);

    if (!isExpiringSoon(dbExpiry)) {
      cachedToken = dbToken;
      tokenExpiry = dbExpiry;
      console.log("Using cached Graph token");
      return cachedToken;
    }
  }

  return ensureFreshToken(pool);
};
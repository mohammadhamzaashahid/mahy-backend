
import fetch from "node-fetch";
import dotenv from "dotenv";
import { getPool } from "../config/mysql.js";
dotenv.config();


let cachedToken = null;
let tokenExpiry = null;
let refreshInFlight = null;

const DEFAULT_REFRESH_BUFFER_MINUTES = 5;

const resolveNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const refreshBufferMinutes = resolveNumber(
  process.env.D365_TOKEN_REFRESH_BUFFER_MINUTES,
  DEFAULT_REFRESH_BUFFER_MINUTES
);
const refreshBufferMs = refreshBufferMinutes * 60 * 1000;
const refreshBufferSeconds = Math.max(0, Math.floor(refreshBufferMs / 1000));

const isExpiringSoon = (expiresAt) => {
  if (!expiresAt) return true;
  const expiresInMs = expiresAt.getTime() - Date.now();
  return expiresInMs <= refreshBufferMs;
};

const resolveExpiry = (data) => {
  const now = Date.now();

  if (data.expires_on) {
    const expiresOnSeconds = Number.parseInt(data.expires_on, 10);
    if (Number.isFinite(expiresOnSeconds)) {
      return new Date(expiresOnSeconds * 1000);
    }
  }

  if (data.expires_in) {
    const expiresInSeconds = Number.parseInt(data.expires_in, 10);
    if (Number.isFinite(expiresInSeconds)) {
      return new Date(now + expiresInSeconds * 1000);
    }
  }

  return new Date(now + 55 * 60 * 1000);
};

const fetchAndPersistToken = async (pool, tokenUrl, bodyParams) => {
  console.log("Fetching new D365 access token from Azure AD...");
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(bodyParams).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get D365 token (${response.status}): ${text}`);
  }

  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiry = resolveExpiry(data);

  await pool.query("DELETE FROM D365TokenCache");
  await pool.query(
    "INSERT INTO D365TokenCache (AccessToken, ExpiresOn) VALUES (?, ?)",
    [cachedToken, tokenExpiry]
  );

  console.log(`Token fetched & valid until ${tokenExpiry.toISOString()}`);
  return cachedToken;
};

const ensureFreshToken = async (pool, tokenUrl, params) => {
  if (!refreshInFlight) {
    refreshInFlight = fetchAndPersistToken(pool, tokenUrl, params)
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

export const getD365AccessToken = async (forceRefresh = false) => {
  const tenantId = process.env.tenant_id;
  const clientId = process.env.client_id;
  const clientSecret = process.env.client_secret;
  const resource = process.env.env_url;
  const grantType = process.env.grant_type || "client_credentials";
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;

  if (
    !forceRefresh &&
    cachedToken &&
    tokenExpiry &&
    !isExpiringSoon(tokenExpiry)
  ) {
    return cachedToken;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  const pool = await getPool();

  if (!forceRefresh) {
    const checkSql = `
      SELECT AccessToken, ExpiresOn
      FROM D365TokenCache
      WHERE ExpiresOn > DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${refreshBufferSeconds} SECOND)
      ORDER BY Id DESC LIMIT 1;
    `;

    const [rows] = await pool.query(checkSql);
    if (rows.length) {
      const dbToken = rows[0].AccessToken;
      const dbExpiry = new Date(rows[0].ExpiresOn);

      if (!isExpiringSoon(dbExpiry)) {
        cachedToken = dbToken;
        tokenExpiry = dbExpiry;
        console.log("Using cached D365 access token (valid)");
        return cachedToken;
      }
    }
  }

  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    resource,
    grant_type: grantType,
  };

  return ensureFreshToken(pool, tokenUrl, params);
};

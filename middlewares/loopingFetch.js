

import fetch from 'node-fetch';
import { getD365AccessToken } from './getD365AccessToken.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function loopingFetch(url, opts = {}, attempt = 1) {
  try {
    const res = await fetch(url, opts);

    if (res.status >= 500 && res.status < 600 && attempt <= 5) {
      const delay = Math.min(60000, 2 ** attempt * 1000);
      console.warn(`${res.status} from ${url}, retrying in ${delay / 1000}s (attempt ${attempt})`);
      await sleep(delay);
      return loopingFetch(url, opts, attempt + 1);
    }

    return res;
  } catch (err) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'];
    if (retryableCodes.includes(err.code) && attempt <= 7) {
      const delay = Math.min(60000, 2 ** attempt * 800);
      console.warn(` ${err.code} on ${url}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt})`);
      await sleep(delay);
      return loopingFetch(url, opts, attempt + 1);
    }
    throw err;
  }
}

export async function* odataPaged(url, headers) {
  let next = url;
  let page = 1;
  let refreshed = false;

  while (next) {
    let res = await loopingFetch(next, { headers });

    if (res.status === 401) {
      console.warn('Token expired mid-sync refreshing D365 token...');
      try {
        const newToken = await getD365AccessToken(true);
        headers.Authorization = `Bearer ${newToken}`;
        refreshed = true;
        res = await loopingFetch(next, { headers });
      } catch (e) {
        const body = await res.text().catch(() => '');
        throw new Error(`unauthorized (401): token refresh failed (${e.message}) | original: ${body}`);
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`fetch failed (${res.status}): ${text}`);
    }

    let body;
    try {
      body = await res.json();
    } catch (err) {
      console.warn(`invalid JSON on page ${page}, retrying once...`);
      await sleep(2000);
      res = await loopingFetch(next, { headers });
      body = await res.json();
    }

    yield body;

    next = body['@odata.nextLink'] || null;
    page++;
    if (refreshed) refreshed = false;
  }
}

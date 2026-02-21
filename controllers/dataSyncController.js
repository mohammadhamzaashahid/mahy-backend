
import { getPool } from "../config/mysql.js";
import { getD365AccessToken } from "../middlewares/getD365AccessToken.js";
import { odataPaged } from "../middlewares/loopingFetch.js";

export const syncDataEntity = async (req, res, next) => {
  try {
    const { entity, table } = req.query;
    if (!entity || !table) {
      return res.status(400).json({ success: false, message: "Missing entity or table query param." });
    }

    const pool = await getPool();
    const token = await getD365AccessToken();
    const baseUrl = process.env.env_url;
    const companies = await tryGetCompanies(baseUrl, token);
    const dataAreas = companies.length ? companies : [null];

    console.log(`sncing entity: ${entity} → table: ${table}`);
    console.log(`Partitioned over ${dataAreas.length} dataAreaId(s)`);

    await ensureBaseTable(pool, table);
    await pool.query(`TRUNCATE TABLE \`${table}\``);

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      Prefer: "odata.maxpagesize=1000",
    };

    let totalInserted = 0;
    let totalPages = 0;

    for (const da of dataAreas) {
      const filter = da ? `?$filter=dataAreaId eq '${da}'` : "";
      const url = `${baseUrl}data/${entity}${filter}${filter ? "&" : "?"}cross-company=true`;
      console.log(`Fetching partition: ${da ?? "(none)"} → ${url}`);

      for await (const page of odataPaged(url, headers)) {
        const rows = page?.value || [];
        totalPages++;
        if (!rows.length) continue;

        // const flat = rows.map(r => cleanData(flattenRecord(r))); ->old

        // new
        let flat = rows.map(r => cleanData(flattenRecord(r)));

        if (entity.toLowerCase().includes('transfer')) {
          flat = flat.map(r => {
            if (
              r.TransferOrderNumber &&
              typeof r.TransferOrderNumber === 'string' &&
              !r.TransferOrderNumber.startsWith('TO-')
            ) {
              const fixed = r.TransferOrderNumber.trim();
              if (/^O-\d+/.test(fixed)) {
                r.TransferOrderNumber = 'T' + fixed;
              }
            }
            return r;
          });
        }
        const cols = mergeColumns(flat);

        await ensureColumns(pool, table, cols);

        const avgRowSize = JSON.stringify(flat[0] || {}).length;
        const batchSize = avgRowSize > 5000 ? 1000 : avgRowSize > 2500 ? 1000
          : 500;

        for (let i = 0; i < flat.length; i += batchSize) {
          const slice = flat.slice(i, i + batchSize);
          const inserted = await safeBulkInsert(pool, table, cols, slice);
          totalInserted += inserted;
          console.log(`  ${da ?? "ALL"} page#${totalPages} chunk ${i / batchSize + 1}: +${inserted} rows`);
        }
      }
    }

    res.json({
      success: true,
      message: `Synced ${totalInserted} rows from ${entity} to ${table} (${dataAreas.length} partitions).`,
      rows: totalInserted,
      pages: totalPages,
    });
  } catch (err) {
    console.error("sync failed:", err);
    next(err);
  }
};


async function tryGetCompanies(baseUrl, token) {
  try {
    const res = await fetch(`${baseUrl}data/Companies?$select=DataAreaId`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        Prefer: "odata.maxpagesize=200",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.from(new Set((data?.value || []).map(x => x.DataAreaId).filter(Boolean)));
  } catch {
    return [];
  }
}

async function ensureBaseTable(pool, tableName) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      __init__ TEXT NULL
    ) ENGINE=InnoDB 
    DEFAULT CHARSET=utf8mb4 
    COLLATE=utf8mb4_unicode_ci
    ROW_FORMAT=DYNAMIC;
  `);
}

async function ensureColumns(pool, tableName, columns) {
  for (const col of columns) {
    try {
      const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [col]);
      if (rows.length === 0) {
        await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${col}\` TEXT NULL;`);
        console.log(`Added missing column: ${col}`);
      }
    } catch (err) {
      console.warn(`column ensure failed for ${col}: ${err.message}`);
    }
  }
}

function flattenRecord(obj, prefix = "", acc = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("@odata")) continue;
    const key = prefix ? `${prefix}_${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flattenRecord(v, key, acc);
    else if (Array.isArray(v)) acc[key] = JSON.stringify(v);
    else acc[key] = v;
  }
  return acc;
}

function cleanData(record) {
  const out = {};
  for (const [k, v] of Object.entries(record)) out[k] = cleanValue(v);
  return out;
}

function cleanValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace("T", " ");
  if (typeof value === "object") return JSON.stringify(value);

  let v = String(value).trim();

  const truthy = ["yes", "true", "1", "y", "t", "active", "enabled"];
  const falsy = ["no", "false", "0", "n", "f", "inactive", "disabled"];
  const neutral = ["none", "all", "notset", "unknown", "blank"];

  if (truthy.includes(v.toLowerCase())) return 1;
  if (falsy.includes(v.toLowerCase())) return 0;
  if (neutral.includes(v.toLowerCase())) return null;

  if (!isNaN(Date.parse(v)) && v.includes("T")) return v.slice(0, 19).replace("T", " ");
  if (v.length > 60000) v = v.slice(0, 60000);

  return v;
}

function mergeColumns(records) {
  const s = new Set();
  for (const r of records) Object.keys(r).forEach(k => s.add(k));
  return Array.from(s);
}


async function safeBulkInsert(pool, table, columns, records) {
  if (!records.length) return 0;

  const colList = columns.map(c => `\`${c}\``).join(",");
  const placeholders = `(${columns.map(() => "?").join(",")})`;
  const values = [];

  for (const rec of records) columns.forEach(c => values.push(rec[c] ?? null));

  const sql = `
    INSERT INTO \`${table}\` (${colList})
    VALUES ${records.map(() => placeholders).join(",")};
  `;


  try {
    await pool.query(sql, values);
    return records.length;
  } catch (err) {
    if (err.message.includes("Data too long for column")) {
      const match = err.message.match(/column '(.+?)'/i);
      const col = match?.[1];
      if (col) {
        console.warn(`expanding column '${col}' to LONGTEXT due to length issue`);
        await pool.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${col}\` LONGTEXT NULL;`);
        return await safeBulkInsert(pool, table, columns, records);
      }
    }

    console.error(`bulk insert failed permanently: ${err.message}`);

    let ok = 0;
    for (const rec of records) {
      try {
        const valList = columns.map(() => "?").join(",");
        await pool.query(`INSERT INTO \`${table}\` (${colList}) VALUES (${valList})`, columns.map(c => rec[c] ?? null));
        ok++;
      } catch { }
    }
    console.warn(`recovered ${ok}/${records.length} records after fallback.`);
    return ok;
  }
}



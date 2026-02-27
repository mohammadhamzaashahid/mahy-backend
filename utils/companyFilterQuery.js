export async function queryWithCompanyFilter(pool, tableName, req, options = {}) {
  const {
    companyParamName = "company",
    companyColumn = "dataAreaId",  
    requireCompany = false,      
    allowedCompanies = null,     
    limit = null,                  
    orderBy = null,               
  } = options;

  const company = (req.query?.[companyParamName] || "").trim();

  if (requireCompany && !company) {
    const err = new Error("Missing required query param: ?company=");
    err.statusCode = 400;
    throw err;
  }

  if (allowedCompanies && company && !allowedCompanies.includes(company)) {
    const err = new Error("Invalid company value.");
    err.statusCode = 400;
    throw err;
  }

  const [cols] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const hasCompanyColumn = cols.some((c) => c.Field === companyColumn);

  let sql = `SELECT * FROM \`${tableName}\``;
  const params = [];

  if (company && hasCompanyColumn) {
    sql += ` WHERE \`${companyColumn}\` = ?`;
    params.push(company);
  }

  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  if (limit) sql += ` LIMIT ${Number(limit)}`;

  const [rows] = await pool.query(sql, params);
  return rows;
}
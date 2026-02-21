import { getPool } from "../config/mysql.js";
import ExcelJS from "exceljs";

export const createTableFromSchema = async (req, res, next) => {
  try {
    const { tableName, sampleRecord } = req.body;
    if (!tableName || !sampleRecord) {
      return res.status(400).json({
        success: false,
        message: "Both tableName and sampleRecord are required.",
      });
    }

    const pool = await getPool();

    // await pool.query(`SET GLOBAL innodb_file_per_table = ON;`);
    // await pool.query(`SET GLOBAL innodb_strict_mode = OFF;`);

    const rawColumns = Object.entries(sampleRecord).map(([key, value]) => ({
      key,
      type: inferMySqlType(key, value),
      estimatedSize: estimateSize(value),
    }));

    const totalInlineBytes = rawColumns.reduce((sum, col) => sum + col.estimatedSize, 0);
    console.log(`🔍 Estimated row size for ${tableName}: ${totalInlineBytes} bytes`);

    const adjustedColumns = rawColumns.map((col) => {
      if (totalInlineBytes > 8000 && col.type.startsWith("VARCHAR")) {
        return { ...col, type: "TEXT" };
      }
      return col;
    });

    const columnsSQL = adjustedColumns
      .map(({ key, type }) => `\`${key}\` ${type}`)
      .join(",\n  ");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`${tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ${columnsSQL}
      ) ENGINE=InnoDB 
      ROW_FORMAT=DYNAMIC 
      DEFAULT CHARSET=utf8mb4 
      COLLATE=utf8mb4_unicode_ci;
    `;

    console.log(`Creating table '${tableName}' safely...`);
    await pool.query(createTableQuery);

    res.status(201).json({
      success: true,
      message: `Table '${tableName}' created successfully (auto-adjusted for size).`,
    });
  } catch (err) {
    console.error("Error creating table:", err);
    next(err);
  }
};


function inferMySqlType(key, value) {
  if (value === null || value === undefined) return "TEXT";

  const lowerKey = key.toLowerCase();

  if (typeof value === "string" && ["yes", "no", "true", "false"].includes(value.toLowerCase())) {
    return "BOOLEAN";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "BIGINT" : "DECIMAL(18,4)";
  }

  if (typeof value === "string" && isValidISODateString(value)) {
    return "DATETIME NULL";
  }

  if (
    lowerKey.includes("address") ||
    lowerKey.includes("description") ||
    lowerKey.includes("formatted") ||
    lowerKey.includes("notes") ||
    lowerKey.includes("comment") ||
    lowerKey.includes("text") ||
    lowerKey.includes("details")
  ) {
    return "TEXT";
  }

  if (
    lowerKey.endsWith("id") ||
    lowerKey.endsWith("code") ||
    lowerKey.endsWith("number") ||
    lowerKey.endsWith("group") ||
    lowerKey.endsWith("type") ||
    lowerKey.endsWith("status") ||
    lowerKey.endsWith("name")
  ) {
    return "VARCHAR(100)";
  }

  if (typeof value === "string") {
    if (value.length <= 50) return "VARCHAR(50)";
    if (value.length <= 255) return "VARCHAR(255)";
    return "TEXT";
  }

  return "TEXT";
}

function estimateSize(value) {
  if (value === null || value === undefined) return 10;
  if (typeof value === "boolean") return 1;
  if (typeof value === "number") return 8;
  if (typeof value === "string") {
  
    return Math.min(100, value.length) + 4;
  }
  return 20;
}

function isValidISODateString(value) {
  if (typeof value !== "string") return false;

  // Strict ISO 8601 UTC format: YYYY-MM-DDTHH:mm:ssZ
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

  if (!isoRegex.test(value)) return false;

  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}




export const exportTableTemplate = async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!tableName || !tableName.trim()) {
      return res.status(400).json({
        error: "tableName is required"
      });
    }

    const pool = await getPool();

    const [tableCheck] = await pool.query(
      `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      `,
      [tableName]
    );

    if (!tableCheck.length) {
      return res.status(404).json({
        error: `Ttble '${tableName}' does not exist`
      });
    }

    const [columns] = await pool.query(
      `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
      `,
      [tableName]
    );

    if (!columns.length) {
      return res.status(404).json({
        error: `No columns found for table '${tableName}'`
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tableName);

    worksheet.columns = columns.map(col => ({
      header: col.COLUMN_NAME,
      key: col.COLUMN_NAME,
      width: 28
    }));


    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ); //added header
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${tableName}_template.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("export Table template error:", err);
    res.status(500).json({
      error: "failed to generate xcel template",
      details: err.message
    });
  }
};

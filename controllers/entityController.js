import { getPool } from "../config/mysql.js";

export const getCompanies = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM LegalEntities");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching companies:", error);
    res.status(500).json({
      message: "error fetching companies",
      error: error.message,
    });
  }
};
import { getPool } from "../config/mysql.js";

export const generateNextCustomerAccountNum = async () => {
  const pool = await getPool();

  const [result] = await pool.query(
    `INSERT INTO customer_account_sequence VALUES ()`,
  );

  const id = result.insertId;
  const accountNum = `C-${String(id).padStart(6, "0")}`;

  return accountNum;
};

export const generateNextVendAccountNum = async () => {
  const pool = await getPool();

  const [result] = await pool.query(
    `INSERT INTO vend_account_sequence VALUES ()`,
  );

  const id = result.insertId;
  const accountNum = `C-${String(id).padStart(6, "0")}`;

  return accountNum;
};

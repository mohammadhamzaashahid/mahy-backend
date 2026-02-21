import { getPool } from "../config/mysql.js";

export const getPaymentTerms = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM PaymentTerms");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching payment terms:", error);
    res.status(500).json({
      message: "error fetching payment terms",
      error: error.message,
    });
  }
};


export const getCurrencies = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM Currencies");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching currencies:", error);
    res.status(500).json({
      message: "error fetching currencies",
      error: error.message,
    });
  }
};


export const getDeliveryTerms = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM DeliveryTerms");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching dlv terms:", error);
    res.status(500).json({
      message: "error fetching dlv terms",
      error: error.message,
    });
  }
};


export const getTaxGroups = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM TaxGroups");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching tax groups:", error);
    res.status(500).json({
      message: "error fetching tax groups",
      error: error.message,
    });
  }
};


export const getDlvModes = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM DeliveryModesV2");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching dlv modes", error);
    res.status(500).json({
      message: "error fetching dlv modes",
      error: error.message,
    });
  }
};

export const getCustomerPaymentMethods = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM CustomerPaymentMethods");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching Customer Payment Methods", error);
    res.status(500).json({
      message: "error fetching Customer Payment Methods",
      error: error.message,
    });
  }
};


export const getLineOfBusiness = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM OfBusinesses");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching Line of Business", error);
    res.status(500).json({
      message: "error fetching Line of Business ",
      error: error.message,
    });
  }
};

export const getZipCodes = async (req, res) => {
  try {
    const pool = await getPool();

    const [rows] = await pool.query("SELECT * FROM addresspostalcodesv3");

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching zip codes", error);
    res.status(500).json({
      message: "error fetching zip codes",
      error: error.message,
    });
  }
};

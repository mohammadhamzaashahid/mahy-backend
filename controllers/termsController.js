import { getPool } from "../config/mysql.js";
import { queryWithCompanyFilter } from "../utils/companyFilterQuery.js";

export const getPaymentTerms = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "PaymentTerms", req, {
      orderBy: "Name ASC",
    });
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching payment terms:", error);
    res.status(error.statusCode || 500).json({
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

export const getCustomerGroups = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "CustomerGroups", req);
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching Customer Groups", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching Customer Groups",
      error: error.message,
    });
  }
};

export const getDeliveryTerms = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "DeliveryTerms", req);
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching dlv terms:", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching dlv terms",
      error: error.message,
    });
  }
};

export const getTaxGroups = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "TaxGroups", req);
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching tax groups:", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching tax groups",
      error: error.message,
    });
  }
};

export const getDlvModes = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "DeliveryModesV2", req);
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching dlv modes", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching dlv modes",
      error: error.message,
    });
  }
};

export const getCustomerPaymentMethods = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(
      pool,
      "CustomerPaymentMethods",
      req,
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching Customer Payment Methods", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching Customer Payment Methods",
      error: error.message,
    });
  }
};

export const getLineOfBusiness = async (req, res) => {
  try {
    const pool = await getPool();
    const rows = await queryWithCompanyFilter(pool, "OfBusinesses", req);
    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching Line of Business", error);
    res.status(error.statusCode || 500).json({
      message: "error fetching Line of Business",
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

export const getCitiesByCountry = async (req, res) => {
  try {
    const { country } = req.query; 

    if (!country) {
      return res.status(400).json({
        message: "country parameter is required",
      });
    }

    const pool = await getPool();

    const [rows] = await pool.query(
      `
      SELECT 
       *
      FROM addresscities c
      INNER JOIN addresscountryregions cr 
        ON c.CountryRegionId = cr.CountryRegion
      WHERE cr.CountryRegion = ?
      ORDER BY c.Name ASC
      `,
      [country]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("error fetching cities by country:", error);
    res.status(500).json({
      message: "error fetching cities by country",
      error: error.message,
    });
  }
};

export const getAddressCountries = async (req, res) => {
  try{
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM addresscountryregions");

    res.status(200).json(rows);

  }
  catch(error){
    console.error("error fetching countries", error);
    res.status(500).json({
      message: "error fetching countries",
      error: error.message,
    })
  }
}

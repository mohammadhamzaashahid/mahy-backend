import { CRM_COUNTRIES } from "./crmCountryMap.js";

function normalizeCountry(value) {
  if (!value) return "";

  return String(value)
    .trim()
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/-/g, " ")
    .replace(/&/g, "AND")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
}

function simplifyCountryName(value) {
  let normalized = normalizeCountry(value);

  const prefixes = [
    "THE ",
    "REPUBLIC OF ",
    "STATE OF ",
    "KINGDOM OF ",
    "SULTANATE OF ",
    "ISLAMIC REPUBLIC OF ",
    "FEDERAL REPUBLIC OF ",
    "DEMOCRATIC REPUBLIC OF ",
    "FEDERAL DEMOCRATIC REPUBLIC OF ",
    "PEOPLE'S REPUBLIC OF ",
    "PEOPLES REPUBLIC OF ",
    "COMMONWEALTH OF ",
    "COMMONWEALTH OF THE ",
    "UNITED REPUBLIC OF ",
    "UNITED STATES OF ",
    "UNION OF THE ",
    "PRINCIPALITY OF ",
    "GRAND DUCHY OF ",
    "HASHEMITE KINGDOM OF ",
    "SWISS CONFEDERATION",
  ];

  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.replace(prefix, "").trim();
    }
  }

  return normalized;
}

function buildPossibleCountryValues(country) {
  const id = country.id || country.mah_countryid;
  const code = country.code || country.mah_name;
  const name =
    country.name ||
    country.mah_countrylongname ||
    country.mah_name ||
    country.code;

  const values = [
    code,
    name,
    country.mah_name,
    country.mah_countrylongname,
    ...(country.aliases || []),
  ].filter(Boolean);

  const normalizedCode = normalizeCountry(code);
  const simplifiedName = simplifyCountryName(name);

  if (simplifiedName) {
    values.push(simplifiedName);
  }

  if (normalizedCode === "ARE") {
    values.push(
      "UAE",
      "U.A.E",
      "United Arab Emirates",
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "RAK",
      "Ras Al Khaimah",
      "Al Ain"
    );
  }

  if (normalizedCode === "SAU") {
    values.push(
      "KSA",
      "Saudi",
      "Saudi Arabia",
      "Kingdom of Saudi Arabia"
    );
  }

  if (normalizedCode === "KWT") {
    values.push("Kuwait", "State of Kuwait");
  }

  if (normalizedCode === "QAT") {
    values.push("Qatar", "State of Qatar");
  }

  if (normalizedCode === "OMN") {
    values.push("Oman", "Sultanate of Oman");
  }

  if (normalizedCode === "BHR") {
    values.push("Bahrain", "Kingdom of Bahrain");
  }

  if (normalizedCode === "PAK") {
    values.push("Pakistan", "Islamic Republic of Pakistan");
  }

  if (normalizedCode === "GBR" || normalizedCode === "UK") {
    values.push(
      "UK",
      "United Kingdom",
      "Great Britain",
      "England",
      "United Kingdom of Great Britain and Northern Ireland"
    );
  }

  if (normalizedCode === "USA") {
    values.push(
      "US",
      "USA",
      "United States",
      "America",
      "United States of America"
    );
  }

  return values.filter(Boolean);
}

export function resolveCRMCountry(countryInput) {
  const normalizedInput = normalizeCountry(countryInput);
  const simplifiedInput = simplifyCountryName(countryInput);

  if (!normalizedInput) {
    return null;
  }

  for (const country of CRM_COUNTRIES) {
    const id = country.id || country.mah_countryid;
    const code = country.code || country.mah_name;
    const name =
      country.name ||
      country.mah_countrylongname ||
      country.mah_name ||
      country.code;

    if (!id || !code) {
      continue;
    }

    const possibleValues = buildPossibleCountryValues(country);

    const matched = possibleValues.some((value) => {
      const normalizedValue = normalizeCountry(value);
      const simplifiedValue = simplifyCountryName(value);

      return (
        normalizedValue === normalizedInput ||
        simplifiedValue === simplifiedInput
      );
    });

    if (matched) {
      return {
        id,
        code,
        name,
      };
    }
  }

  return null;
}
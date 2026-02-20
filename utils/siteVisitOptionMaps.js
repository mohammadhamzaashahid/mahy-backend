export const mapSector = (val) => ({
  "Trading & Distribution": 124620000,
  Engineering: 124620001,
  Manufacturing: 124620002,
  Logistics: 124620003,
  Energy: 124620004,
  Hospitality: 124620005,
  Automotive: 124620006,
  Other: 124620007,
}[val] ?? null);

export const mapCountry = (val) => ({
  UAE: 124620000,
  KSA: 124620001,
  Oman: 124620002,
  Qatar: 124620003,
  Bahrain: 124620004,
  Kuwait: 124620005,
  Other: 124620006,
}[val] ?? null);

export const mapTypeOfSite = (val) => ({
  Residential: 124620000,
  Commercial: 124620001,
  Industrial: 124620002,
  Infrastructure: 124620003,
}[val] ?? null);

export const mapUrgency = (val) => ({
  Normal: 124620000,
  High: 124620001,
  Critical: 124620002,
}[val] ?? null);

export const mapHearAbout = (val) => ({
  Google: 124620000,
  "Social Media": 124620001,
  Referral: 124620002,
  "Existing Client": 124620003,
  Other: 124620004,
}[val] ?? null);

export const mapNatureOfRequirement = (val) => ({
  Inspection: 124620000,
  Survey: 124620001,
  Installation: 124620002,
  Maintenance: 124620003,
  Repair: 124620004,
  Consultation: 124620005,
}[val] ?? null);

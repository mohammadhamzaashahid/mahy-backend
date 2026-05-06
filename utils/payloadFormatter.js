import { resolveCRMCountry } from "./crmCountryResolver.js";

export function formatCRMLead(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payload structure");
  }

  const LEAD_TYPE = {
    FLEET: 124620000,
    RETAIL: 124620001,
    FOREIGN: 124620002,
    GCC: 124620003,
    LOCAL: 124620004,
  };

  const answers = raw.answers || {};
  const qmap = answers._qmap || [];

  let remarks = "";

  if (answers.business) {
    remarks += `${answers.business}\n\n`;
  }

  // qmap.forEach(({ question, answer }) => {
  //   remarks += `Q: ${question}\nA: ${answer}\n\n`;
  // });

  const LOCATION_QUESTION = "May I know your location";

  const COUNTRY_QUESTION = "Please select your country";

  for (let i = 0; i < qmap.length; i += 1) {
    const item = qmap[i] || {};

    const question = item.question || "";

    const answer = item.answer || "";

    const isLocationQuestion = question.includes(LOCATION_QUESTION);

    const isCountryQuestion = question.includes(COUNTRY_QUESTION);

    if (isCountryQuestion) {
      continue;
    }

    if (isLocationQuestion && answer === "Others") {
      const countryAnswer =
        answers.country ||
        qmap.find((q) => q?.question?.includes(COUNTRY_QUESTION))?.answer ||
        "Others";

      remarks += `Q: ${question}\nA: ${countryAnswer}\n\n`;

      continue;
    }

    remarks += `Q: ${question}\nA: ${answer}\n\n`;
  }

  const fullname = answers.name?.trim() || "";
  const firstSpace = fullname.indexOf(" ");

  const firstname =
    firstSpace !== -1 ? fullname.slice(0, firstSpace) : fullname;

  const lastname = firstSpace !== -1 ? fullname.slice(firstSpace + 1) : "";

  const salesUnitLookup = {
    "Abu Dhabi": 809880000,
    Dubai: 809880007,
    Sharjah: 809880009,
    RAK: 809880008,
    "Al Ain": 809880011,
    Furniture: 809880004,
    "Service Division": 809880010,
  };

  let mk_salesunit = salesUnitLookup[answers.uaeArea] || null;

  let mk_enquiryto = null;
  let mk_leadtype = null;
  let countryInput = null;

  if (answers.location === "UAE") {
    mk_enquiryto = `Local - ${answers.uaeArea}`;
    mk_leadtype = LEAD_TYPE.LOCAL;
    countryInput = "UAE";
  }

  if (answers.location === "GCC") {
    mk_enquiryto = answers.gccCountry;
    mk_leadtype = LEAD_TYPE.GCC;
    countryInput = answers.gccCountry;
  }

  if (answers.location === "Others") {
    mk_salesunit = salesUnitLookup.Dubai;
    mk_enquiryto = "Dubai";
    mk_leadtype = LEAD_TYPE.FOREIGN;
    countryInput = answers.country;
  }

  const crmCountry = resolveCRMCountry(countryInput);

  let latitude = null;
  let longitude = null;
  let mk_sitelocation = null;

  if (answers.siteLocation) {
    latitude = answers.siteLocation.lat;
    longitude = answers.siteLocation.lng;
    mk_sitelocation = `${latitude},${longitude}`;
  }

  const payload = {
    firstname,
    lastname,
    emailaddress1: answers.email,
    mobilephone: answers.phone,

    subject: answers.business || "Chatbot Enquiry",
    description: "Lead via chatbot",

    mk_remarks: remarks.trim(),

    mk_salesunit,

    mk_enquiryto,
    mk_leadtype,

    mk_sitelocation,

    address1_latitude: latitude,
    address1_longitude: longitude,

    leadsourcecode: 124620001,
  };

  if (crmCountry) {
    payload.address1_country = crmCountry.name;
    payload.address2_country = crmCountry.name;

    payload["mk_CountryRegion@odata.bind"] = `/mah_countries(${crmCountry.id})`;

    payload["mk_CountryCode@odata.bind"] = `/mah_countries(${crmCountry.id})`;
  } else if (countryInput) {
    payload.address1_country = countryInput;
    payload.address2_country = countryInput;
  }

  Object.keys(payload).forEach((key) => {
    if (
      payload[key] === null ||
      payload[key] === undefined ||
      payload[key] === ""
    ) {
      delete payload[key];
    }
  });

  return payload;
}

// export function formatCRMLead(raw) {
//   if (!raw || typeof raw !== "object") {
//     throw new Error("Invalid payload structure");
//   }

//   const LEAD_TYPE = {
//     FLEET: 124620000,
//     RETAIL: 124620001,
//     FOREIGN: 124620002,
//     GCC: 124620003,
//     LOCAL: 124620004,
//   };

//   const answers = raw.answers || {};
//   const qmap = answers._qmap || [];

//   let remarks = "";

//   if (answers.business) {
//     remarks += `${answers.business}\n\n`;
//   }

//   qmap.forEach(({ question, answer }) => {
//     remarks += `Q: ${question}\nA: ${answer}\n\n`;
//   });

//   const fullname = answers.name?.trim() || "";
//   const firstSpace = fullname.indexOf(" ");

//   const firstname =
//     firstSpace !== -1 ? fullname.slice(0, firstSpace) : fullname;

//   const lastname = firstSpace !== -1 ? fullname.slice(firstSpace + 1) : "";

//   const salesUnitLookup = {
//     "Abu Dhabi": 809880000,
//     Dubai: 809880007,
//     Sharjah: 809880009,
//     RAK: 809880008,
//     "Al Ain": 809880011,
//     Furniture: 809880004,
//     "Service Division": 809880010,
//   };

//   const mk_salesunit = salesUnitLookup[answers.uaeArea] || null;

//   let mk_enquiryto = null;
//   let mk_leadtype = null;

//   if (answers.location === "UAE") {
//     mk_enquiryto = `Local - ${answers.uaeArea}`;
//     mk_leadtype = LEAD_TYPE.LOCAL;
//   }

//   if (answers.location === "GCC") {
//     mk_enquiryto = answers.gccCountry;
//     mk_leadtype = LEAD_TYPE.GCC;
//   }

//   if (answers.location === "Others") {
//     mk_leadtype = LEAD_TYPE.FOREIGN;
//     mk_enquiryto = "Dubai";
//   }

//   let latitude = null;
//   let longitude = null;
//   let mk_sitelocation = null;

//   if (answers.siteLocation) {
//     latitude = answers.siteLocation.lat;
//     longitude = answers.siteLocation.lng;
//     mk_sitelocation = `${latitude},${longitude}`;
//   }

//   return {
//     firstname,
//     lastname,
//     emailaddress1: answers.email,
//     mobilephone: answers.phone,

//     subject: answers.business || "Chatbot Enquiry",
//     description: "Lead via chatbot",

//     mk_remarks: remarks.trim(),

//     mk_salesunit,

//     mk_enquiryto,
//     mk_leadtype,

//     mk_sitelocation,

//     address1_latitude: latitude,
//     address1_longitude: longitude,

//     leadsourcecode: 124620001,
//   };
// }

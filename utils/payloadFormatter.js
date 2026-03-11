export function formatCRMLead(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payload structure");
  }

  const answers = raw.answers || {};
  const qmap = answers._qmap || [];

  let remarks = "";

  if (answers.business) {
    remarks += `${answers.business}\n\n`;
  }

  qmap.forEach(({ question, answer }) => {
    remarks += `Q: ${question}\nA: ${answer}\n\n`;
  });

  const fullname = answers.name?.trim() || "";
  const firstSpace = fullname.indexOf(" ");

  const firstname = firstSpace !== -1
    ? fullname.slice(0, firstSpace)
    : fullname;

  const lastname = firstSpace !== -1
    ? fullname.slice(firstSpace + 1)
    : "";

  const salesUnitLookup = {
    "Abu Dhabi": 809880000,
    "Dubai": 809880007,
    "Sharjah": 809880009,
    "RAK": 809880008,
    "Al Ain": 809880011,
    "Furniture": 809880004,
    "Service Division": 809880010,
  };

  const mk_salesunit = salesUnitLookup[answers.uaeArea] || null;

  let mk_enquiryto = null;

  if (answers.location === "UAE") {
    mk_enquiryto = `Local - ${answers.uaeArea}`;
  }

  if (answers.location === "GCC") {
    mk_enquiryto = answers.gccCountry;
  }

  let latitude = null;
  let longitude = null;
  let mk_sitelocation = null;

  if (answers.siteLocation) {
    latitude = answers.siteLocation.lat;
    longitude = answers.siteLocation.lng;
    mk_sitelocation = `${latitude},${longitude}`;
  }

  return {
    firstname,
    lastname,
    emailaddress1: answers.email,
    mobilephone: answers.phone,

    subject: answers.business || "Chatbot Enquiry",
    description: "Lead via chatbot",

    mk_remarks: remarks.trim(),

    mk_salesunit,

    mk_enquiryto,

    mk_sitelocation,

    address1_latitude: latitude,
    address1_longitude: longitude,

    leadsourcecode: 124620001
  };
}
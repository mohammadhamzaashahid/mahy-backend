export function formatCRMLead(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid payload structure");
  }

  const answers = raw.answers || {};
  const qmap = answers._qmap || []; 

  let remarks = "";

  qmap.forEach(({ question, answer }) => {
    remarks += `${question} - ${answer}\n`;
  });

  let fullname = answers.name?.trim() || "";
  const firstSpace = fullname.indexOf(" ");
  const firstname = firstSpace !== -1 ? fullname.slice(0, firstSpace) : fullname;
  const lastname = firstSpace !== -1 ? fullname.slice(firstSpace + 1) : "Unknown";


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

  return {
    firstname,
    lastname,
    emailaddress1: answers.email,
    mobilephone: answers.phone,
    description: "lead via chat bot",
    mk_remarks: remarks.trim(),
    mk_salesunit
  };
}

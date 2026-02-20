// import {
//   mapSector,
//   mapCountry,
//   mapTypeOfSite,
//   mapUrgency,
//   mapHearAbout,
//   mapNatureOfRequirement,
// } from "./siteVisitOptionMaps.js";

// import { encodeFileToBase64 } from "./uploadHelper.js";

// export const mapSiteVisitPayload = (data) => {
//   const crmPayload = {
//     mk_companyname: data.companyName,
//     mk_companyaddress: data.companyAddress,
//     mk_city: data.city,
//     mah_remarks: data.briefDescription,
//     mah_customercontactperson: data.contactPerson,
//     mk_jobtitle: data.jobTitle,
//     mah_contactpersonemailaddress: data.emailAddress,
//     mk_contactnumber: data.mobileNumber,
//     mk_alternativecontactnumber: data.alternativeContactNumber,
//     mk_sitelocation: data.siteLocation,
//     mk_preferredvisitdate: data.preferredVisitDate,
//     mk_problemdetails: data.briefDescription,
//     mk_existingsystem: data.existingSystem,
//     mk_safetyrequirements: data.safetyRequirements,
//     mk_consent: true,

//     mah_name: `Site Visit - ${data.companyName}`,

//     mk_sector: mapSector(data.sector),
//     mk_typeofsite: mapTypeOfSite(data.typeOfSite),
//     mk_urgencylevel: mapUrgency(data.urgencyLevel),
//     mk_country: mapCountry(data.country),
//     mk_howdidyouhearaboutus: mapHearAbout(data.howDidYouHear),

//     mk_natureofrequirement: String(
//       mapNatureOfRequirement(data.natureOfRequirement),
//     ),
//   };

//   const attachments = data.attachFile
//     ? [encodeFileToBase64(data.attachFile)]
//     : [];

//   return { crmPayload, attachments };
// };

import {
  mapSector,
  mapCountry,
  mapTypeOfSite,
  mapUrgency,
  mapHearAbout,
  mapNatureOfRequirement,
} from "./siteVisitOptionMaps.js";

import { encodeFileToBase64 } from "./uploadHelper.js";

export const mapSiteVisitPayload = (data, file = null) => {
  const crmPayload = {
    mk_companyname: data.companyName,
    mk_companyaddress: data.companyAddress,
    mk_city: data.city,
    mah_remarks: data.briefDescription,
    mah_customercontactperson: data.contactPerson,
    mk_jobtitle: data.jobTitle,
    mah_contactpersonemailaddress: data.emailAddress,
    mk_contactnumber: data.mobileNumber,
    mk_alternativecontactnumber: data.alternativeContactNumber,
    mk_sitelocation: data.siteLocation,
    mk_preferredvisitdate: data.preferredVisitDate,
    mk_problemdetails: data.briefDescription,
    mk_existingsystem: data.existingSystem,
    mk_safetyrequirements: data.safetyRequirements,
    mk_consent: true,

    mah_name: `Site Visit - ${data.companyName}`,

    mk_sector: mapSector(data.sector),
    mk_typeofsite: mapTypeOfSite(data.typeOfSite),
    mk_urgencylevel: mapUrgency(data.urgencyLevel),
    mk_country: mapCountry(data.country),
    mk_howdidyouhearaboutus: mapHearAbout(data.howDidYouHear),

    mk_natureofrequirement: String(
      mapNatureOfRequirement(data.natureOfRequirement),
    ),
  };

  const attachments = [];
  if (file && file.buffer) {
    attachments.push(encodeFileToBase64(file));
  }

  console.log(crmPayload, attachments);
  
  return { crmPayload, attachments };
};

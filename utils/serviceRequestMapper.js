import {
  mapOrganizationPerson,
  mapBuildingType,
  mapProductCategory,
  mapUrgency,
  mapPreferredVisit,
  mapBusinessImpact,
  mapPumpSymptoms,
  mapPumpObservedSigns,
  mapACSymptoms,
  mapCarSymptoms,
  mapCarObservedSigns,
  mapWarningLights,
} from "./serviceRequestOptionMaps.js";

import { encodeFileToBase64 } from "./uploadHelper.js";

export const mapServiceRequestPayload = (data, files = {}) => {
  const toDecimal = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const crmPayload = {
    mk_organizationperson: mapOrganizationPerson(data.customerType),

    mk_contactperson: data.contactPerson,
    mk_companyname: data.companyName,
    mk_mobilenumber: `${data.mobileCountryCode}${data.mobileNumber}`,
    mk_email: data.email,

    mk_sitename: data.siteName,
    mk_siteaddress: data.siteAddress,
    mk_locationpin: data.locationPin,
    mk_buildingtype: mapBuildingType(data.buildingType),

    mk_productcategory: mapProductCategory(data.productCategory),
    mk_brand: data.brand,
    mk_model: data.model,
    mk_assettag: data.assetTag,
    mk_warrantystatus: !!data.warrantyStatus,

    ...(data.installationDate && {
      mk_installationdate: data.installationDate,
    }),

    ...(data.contractExpiry && {
      mk_contractexpiry: data.contractExpiry,
    }),

    ...(data.pumpSymptoms && {
      mk_pumpsymptoms: mapPumpSymptoms(data.pumpSymptoms).toString(),
    }),

    ...(data.pumpObservedSigns && {
      mk_pumpobservedsigns: mapPumpObservedSigns(data.pumpObservedSigns).toString(),
    }),

    mk_pumprecentservice: !!data.pumpRecentService,
    mk_powerissue: !!data.pumpPowerIssue,

    // ...(data.suctionPressure !== undefined && {
    //   mk_suctionpressure: data.suctionPressure,
    // }),

    ...(data.suctionPressure !== undefined && {
      mk_suctionpressure: toDecimal(data.suctionPressure),
    }),

    ...(data.dischargePressure !== undefined && {
      mk_dischargepressure: toDecimal(data.dischargePressure),
    }),

    ...(data.flowRate !== undefined && {
      mk_flowrate: toDecimal(data.flowRate),
    }),

    ...(data.voltageAvailable !== undefined && {
      mk_voltageavailable: toDecimal(data.voltageAvailable),
    }),

    ...(data.acSymptoms && {
      mk_acsymptoms: mapACSymptoms(data.acSymptoms),
    }),

    mk_acerrorcode: data.acErrorCode,
    mk_compressorrunning: !!data.compressorRunning,
    mk_fanrunning: !!data.fanRunning,
    mk_airflowweak: !!data.airflowWeak,

    ...(data.roomTemp !== undefined && {
      mk_roomtemp: toDecimal(data.roomTemp),
    }),

    ...(data.setTemp !== undefined && {
      mk_settemp: toDecimal(data.setTemp),
    }),

    mk_platenumber: data.plateNumber,
    mk_carmodel: data.carModel,
    mk_vinnumber: data.vinNumber,
    mk_enginestarts: !!data.engineStarts,
    mk_carrecentservice: !!data.carRecentService,
    mk_accidenthistory: !!data.accidentHistory,

    ...(data.carSymptoms && {
      mk_carsymptoms: mapCarSymptoms(data.carSymptoms),
    }),

    ...(data.carObservedSigns && {
      mk_carobservedsigns: mapCarObservedSigns(data.carObservedSigns),
    }),

    ...(data.warningLights && {
      mk_warninglights: mapWarningLights(data.warningLights),
    }),

    mk_problemdescription: data.problemDescription,
    mk_additionalnotes: data.additionalNotes,

    mk_urgency: mapUrgency(data.urgency).toString(),
    mk_preferredvisit: mapPreferredVisit(data.preferredVisit).toString(),

    ...(data.businessImpact && {
      mk_businessimpact: mapBusinessImpact(data.businessImpact).toString(),
    }),
  };

  const attachments = [];

  const pushFiles = (fileArray) => {
    if (!fileArray) return;
    fileArray.forEach((file) => {
      attachments.push(encodeFileToBase64(file));
    });
  };

  pushFiles(files.uploadPhotos);
  pushFiles(files.uploadVideo);
  pushFiles(files.voiceNote);
  pushFiles(files.errorScreenshot);

  console.log(crmPayload);
  return { crmPayload, attachments };
};

//   if (data.uploadPhotos?.length) {
//     data.uploadPhotos.forEach((file) =>
//       attachments.push(encodeFileToBase64(file))
//     );
//   }

//   if (data.uploadVideo) {
//     attachments.push(encodeFileToBase64(data.uploadVideo));
//   }

//   if (data.voiceNote) {
//     attachments.push(encodeFileToBase64(data.voiceNote));
//   }

//   if (data.errorScreenshot) {
//     attachments.push(encodeFileToBase64(data.errorScreenshot));
//   }

// import {
//   mapOrganizationPerson,
//   mapBuildingType,
//   mapProductCategory,
//   mapUrgency,
//   mapPreferredVisit,
//   mapBusinessImpact,
// } from "./serviceRequestOptionMaps.js";

// import { encodeFileToBase64 } from "./uploadHelper.js";

// export const mapServiceRequestPayload = (data) => {
//   const crmPayload = {

//     mk_organizationperson: mapOrganizationPerson(data.customerType),

//     mk_contactperson: data.contactPerson,
//     mk_companyname: data.companyName,
//     mk_mobilenumber: `${data.mobileCountryCode}${data.mobileNumber}`,
//     mk_email: data.email,

//     mk_sitename: data.siteName,
//     mk_siteaddress: data.siteAddress,
//     mk_locationpin: data.locationPin,
//     mk_buildingtype: mapBuildingType(data.buildingType),

//     mk_productcategory: mapProductCategory(data.productCategory),
//     mk_brand: data.brand,
//     mk_model: data.model,
//     mk_assettag: data.assetTag,
//     mk_warrantystatus: !!data.warrantyStatus,

//     ...(data.installationDate && {
//       mk_installationdate: data.installationDate,
//     }),

//     ...(data.contractExpiry && {
//       mk_contractexpiry: data.contractExpiry,
//     }),

//     ...(data.pumpSymptoms?.length && {
//       mk_pumpsymptoms: data.pumpSymptoms.map(Number),
//     }),

//     ...(data.pumpObservedSigns?.length && {
//       mk_pumpobservedsigns: data.pumpObservedSigns.map(Number),
//     }),

//     mk_pumprecentservice: !!data.pumpRecentService,
//     mk_powerissue: !!data.pumpPowerIssue,

//     ...(data.suctionPressure !== undefined && {
//       mk_suctionpressure: data.suctionPressure,
//     }),

//     ...(data.dischargePressure !== undefined && {
//       mk_dischargepressure: data.dischargePressure,
//     }),

//     ...(data.flowRate !== undefined && {
//       mk_flowrate: data.flowRate,
//     }),

//     ...(data.voltageAvailable !== undefined && {
//       mk_voltageavailable: data.voltageAvailable,
//     }),

//     ...(data.acSymptoms?.length && {
//       mk_acsymptoms: data.acSymptoms.map(Number),
//     }),

//     mk_acerrorcode: data.acErrorCode,
//     mk_compressorrunning: !!data.compressorRunning,
//     mk_fanrunning: !!data.fanRunning,
//     mk_airflowweak: !!data.airflowWeak,

//     ...(data.roomTemp !== undefined && {
//       mk_roomtemp: data.roomTemp,
//     }),

//     ...(data.setTemp !== undefined && {
//       mk_settemp: data.setTemp,
//     }),

//     mk_platenumber: data.plateNumber,
//     mk_carmodel: data.carModel,
//     mk_vinnumber: data.vinNumber,
//     mk_enginestarts: !!data.engineStarts,
//     mk_carrecentservice: !!data.carRecentService,
//     mk_accidenthistory: !!data.accidentHistory,

//     ...(data.carSymptoms?.length && {
//       mk_carsymptoms: data.carSymptoms.map(Number),
//     }),

//     ...(data.carObservedSigns?.length && {
//       mk_carobservedsigns: data.carObservedSigns.map(Number),
//     }),

//     ...(data.warningLights?.length && {
//       mk_warninglights: data.warningLights.map(Number),
//     }),

//     mk_problemdescription: data.problemDescription,
//     mk_additionalnotes: data.additionalNotes,

//     mk_urgency: mapUrgency(data.urgency),
//     mk_preferredvisit: mapPreferredVisit(data.preferredVisit),

//     ...(data.businessImpact?.length && {
//       mk_businessimpact: data.businessImpact.map(mapBusinessImpact),
//     }),
//   };

//   const attachments = [];

//   if (data.uploadPhotos?.length) {
//     data.uploadPhotos.forEach((file) =>
//       attachments.push(encodeFileToBase64(file))
//     );
//   }

//   if (data.uploadVideo) {
//     attachments.push(encodeFileToBase64(data.uploadVideo));
//   }

//   if (data.voiceNote) {
//     attachments.push(encodeFileToBase64(data.voiceNote));
//   }

//   if (data.errorScreenshot) {
//     attachments.push(encodeFileToBase64(data.errorScreenshot));
//   }

//   return { crmPayload, attachments };
// };

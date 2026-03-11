import { d365encodeFileToBase64 } from "./d365encodeFileToBase64.js";

const toFormattedDate = (value) => {
  if (!value) return null;

  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return null;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${mm}-${dd}-${yyyy}`;
};

const TRN_TYPE_MAP = {
  with_trn: "With TRN",
  without_trn: "Without TRN",
};

const yesNo = (v) => (toBool(v) ? "Yes" : "No");

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  if (typeof v === "number") return v === 1;
  return false;
};

export const mapCustomerToD365Payload = (data, files = []) => {
  const keys = [];

  const pushKey = (Field, Value) => {
    if (Value !== undefined && Value !== null && Value !== "") {
      keys.push({ Field, Value: String(Value) });
    }
  };

  const isOrganization = data.customerType === "organization";
  const isPerson = data.customerType === "individual";
  const isUAE = data.country === "UAE";

  // const hasTRN = data.trnType === 'with_trn';

  // pushKey("TRNType", hasTRN ? 1 : 2);

  if (data.trnType) {
    const trnTypeValue = TRN_TYPE_MAP[data.trnType];
    if (!trnTypeValue) {
      throw new Error(`Invalid TRNType: ${data.trnType}`);
    }
    pushKey("TRNType", trnTypeValue);
  }

  pushKey("DirPartyBaseType", isOrganization ? "Organization" : "Person");

  const customerName = isOrganization
    ? data.companyName || data.fullName
    : data.fullName || data.companyName;

  pushKey("Name", customerName);

  pushKey("CustClassificationId", data.classificationGroup);
  pushKey("CustGroup", data.customerGroup);
  pushKey("Currency", data.currency);

  pushKey("PaymTermId", data.paymentTerms);
  pushKey("PaymMode", data.paymentMethod);

  pushKey("DlvTerm", data.deliveryTerms);
  pushKey("DlvMode", data.deliveryMode);
  // pushKey("TRNNumber", data.trn);
  if (data.trnType === "with_trn" && data.trn) {
    pushKey("TRNNumber", data.trn);
  }
  pushKey("TaxGroup", data.salesTaxGroup);
  pushKey("TaxExemptNumber", data.taxExemptNumber);

  // pushKey("HoldingCompany", toBool(data.holdingCompany) ? 1 : 0);
  pushKey("HoldingCompany", yesNo(data.holdingCompany));
  pushKey("CompanyChain", data.companyChain);
  pushKey("SourceCode", data.sourceCode);

  pushKey("LineOfBusinessId", data.lineOfBusiness);
  pushKey("SegmentId", data.segment);
  pushKey("SubsegmentId", data.subsegment);

  // pushKey("VATNum", data.trn);

  // const vatRegistered = toBool(data.vatRegistered) ? 1 : 0;
  // pushKey("VATRegistred", vatRegistered);

  pushKey("VATRegistred", yesNo(data.vatRegistered));

  if (isOrganization) {
    pushKey("TradeLicenseNumber", data.tradeLicense);

    const tlIssueFormatted = toFormattedDate(data.tlIssueDate);
    if (tlIssueFormatted) pushKey("TradeLicenseDateIssue", tlIssueFormatted);

    const tlExpiryFormatted = toFormattedDate(data.tlExpiryDate);
    if (tlExpiryFormatted) pushKey("TradeLicenseDateExpiry", tlExpiryFormatted);
  }

  if (isPerson) {
    if (isUAE) {
      pushKey("EmiratesID", data.emiratesId);

      const eidIssueFormatted = toFormattedDate(data.emiratesIdIssueDate);
      if (eidIssueFormatted) pushKey("EmiratesIDDateIssue", eidIssueFormatted);

      const eidExpiryFormatted = toFormattedDate(data.emiratesIdExpiryDate);
      if (eidExpiryFormatted)
        pushKey("EmiratesIDDateExpiry", eidExpiryFormatted);
    } else {
      pushKey("PassportNum", data.passportNumber);

      const passIssueFormatted = toFormattedDate(data.passportIssueDate);
      if (passIssueFormatted) pushKey("PassportDateIssue", passIssueFormatted);

      const passExpiryFormatted = toFormattedDate(data.passportExpiryDate);
      if (passExpiryFormatted)
        pushKey("PassportDateExpiry", passExpiryFormatted);
    }
  }

  const addresses = [
    {
      Name: "Primary Address",
      Country: data.country,
      City: data.city,
      State: data.state || "",
      Street: data.street,
      ZipCode: data.zipPostalCode || "",
      MakaniNumber: data.makaniNo || "",
      AddressBooks: data.addressBooks || "",
    },
  ];

  const electronicAddresses = [];

  if (data.email) {
    electronicAddresses.push({
      Description: "Email",
      Type: "Email",
      Value: data.email,
      Primary: "Yes",
    });
  }

  if (data.telephone) {
    electronicAddresses.push({
      Description: "Phone",
      Type: "Phone",
      Value: `${data.telCountryCode}${data.telephone}`,
      Extension: data.extension || "",
      Primary: "Yes",
    });
  }

  if (data.mobileNumber) {
    electronicAddresses.push({
      Description: "Mobile",
      Type: "Phone",
      Value: `${data.mobileCountryCode}${data.mobileNumber}`,
      Primary: "No",
    });
  }

  if (data.fax) {
    electronicAddresses.push({
      Description: "Fax",
      Type: "Fax",
      Value: data.fax,
      Primary: "No",
    });
  }

  if (data.website) {
    electronicAddresses.push({
      Description: "Website",
      Type: "URL",
      Value: data.website,
      Primary: "No",
    });
  }

  const attachments = Array.isArray(files)
    ? files.map((file) => d365encodeFileToBase64(file))
    : [];

  return {
    _request: {
      Type: "Customer",
      LegalEntity: data.company || "MAHY",

      AccountNum: data.accountNum,

      Keys: keys,
      Addresses: addresses,
      ElectronicAddresses: electronicAddresses,
      Attachments: attachments,
    },
  };
};

// import { d365encodeFileToBase64 } from "./d365encodeFileToBase64.js";

// const toISODate = (value) => {
//   if (!value) return null;

//   if (value instanceof Date) {
//     return value.toISOString();
//   }

//   if (typeof value === "string") {
//     const d = new Date(value);
//     if (!isNaN(d.getTime())) {
//       return d.toISOString();
//     }
//   }

//   return null;
// };

// export const mapCustomerToD365Payload =  (data, files = []) => {
//   const keys = [];

//   const pushKey = (Field, Value) => {
//     if (Value !== undefined && Value !== null && Value !== "") {
//       keys.push({
//         Field,
//         Value: String(Value),
//       });
//     }
//   };
//   const dirPartyBaseType = data.customerType === "organization" ? 1 : 2;
//   pushKey("DirPartyBaseType", dirPartyBaseType);

//   const customerName =
//     data.customerType === "organization"
//       ? data.companyName || data.fullName
//       : data.fullName || data.companyName;

//   pushKey("Name", customerName);
//   pushKey("CustClassificationId", data.classificationGroup);
//   pushKey("CustGroup", data.customerGroup);
//   pushKey("Currency", data.currency);

//   pushKey("PaymTermId", data.paymentTerms);
//   pushKey("PaymMode", data.paymentMethod);

//   pushKey("DlvTerm", data.deliveryTerms);
//   pushKey("DlvMode", data.deliveryMode);

//   pushKey("TaxGroup", data.salesTaxGroup);

//   pushKey("LineOfBusinessId", data.lineOfBusiness);
//   pushKey("SegmentId", data.segment);
//   pushKey("SubsegmentId", data.subsegment);

//   pushKey("VATNum", data.trn);
//   pushKey("VATRegistred", data.vatRegistered ? 1 : 0);

//   if (data.customerType === "organization") {
//     pushKey("TradeLicenseNumber", data.tradeLicense);

//     const tlIssueISO = toISODate(data.tlIssueDate);
//     if (tlIssueISO) pushKey("TradeLicenseDateIssue", tlIssueISO);

//     const tlExpiryISO = toISODate(data.tlExpiryDate);
//     if (tlExpiryISO) pushKey("TradeLicenseDateExpiry", tlExpiryISO);
//   }

//   if (data.customerType === "individual") {
//     if (data.emiratesId) {
//       pushKey("EmiratesID", data.emiratesId);

//       const eidIssueISO = toISODate(data.emiratesIdIssueDate);
//       if (eidIssueISO) pushKey("EmiratesIDDateIssue", eidIssueISO);

//       const eidExpiryISO = toISODate(data.emiratesIdExpiryDate);
//       if (eidExpiryISO) pushKey("EmiratesIDDateExpiry", eidExpiryISO);
//     }

//     if (data.passportNumber) {
//       pushKey("PassportNum", data.passportNumber);

//       const passIssueISO = toISODate(data.passportIssueDate);
//       if (passIssueISO) pushKey("PassportDateIssue", passIssueISO);

//       const passExpiryISO = toISODate(data.passportExpiryDate);
//       if (passExpiryISO) pushKey("PassportDateExpiry", passExpiryISO);
//     }
//   }

//   const addresses = [
//     {
//       Name: "Primary Address",
//       Country: data.country,
//       City: data.city,
//       State: data.state || "",
//       Street: data.street,
//       ZipCode: data.zipPostalCode || "",
//     },
//   ];

//   const electronicAddresses = [];

//   if (data.email) {
//     electronicAddresses.push({
//       Description: "Email",
//       Type: "Email",
//       value: data.email,
//       Primary: "Yes",
//     });
//   }

//   if (data.telephone) {
//     electronicAddresses.push({
//       Description: "Phone",
//       Type: "Phone",
//       value: `${data.telCountryCode}${data.telephone}`,
//       Primary: "Yes",
//     });
//   }

//   if (data.mobileNumber) {
//     electronicAddresses.push({
//       Description: "Mobile",
//       Type: "Phone",
//       value: `${data.mobileCountryCode}${data.mobileNumber}`,
//       Primary: "No",
//     });
//   }

//   if (data.website) {
//     electronicAddresses.push({
//       Description: "Website",
//       Type: "URL",
//       value: data.website,
//       Primary: "No",
//     });
//   }

//   const attachments = Array.isArray(files)
//     ? files.map((file) => d365encodeFileToBase64(file))
//     : [];
//   return {
//     _request: {
//       Type: "Customer",
//       LegalEntity: "MAHY",
//       AccountNum: data.accountNum,
//       Keys: keys,
//       Addresses: addresses,
//       ElectronicAddresses: electronicAddresses,
//       Attachments: attachments,
//     },
//   };
// };

// import { d365encodeFileToBase64 } from "./d365encodeFileToBase64.js";

// const toISODate = (value) => {
//   if (!value) return null;

//   if (value instanceof Date) {
//     return value.toISOString();
//   }

//   if (typeof value === "string") {
//     const d = new Date(value);
//     if (!isNaN(d.getTime())) {
//       return d.toISOString();
//     }
//   }

//   return null;
// };

// export const mapCustomerToD365Payload = (data, files = []) => {
//   const keys = [];

//   const pushKey = (Field, Value) => {
//     if (Value !== undefined && Value !== null && Value !== "") {
//       keys.push({ Field, Value: String(Value) });
//     }
//   };

//   pushKey("Name", data.companyName || data.fullName);
//   pushKey("CustClassificationId", data.classificationGroup);
//   pushKey("CustGroup", data.customerGroup);
//   pushKey("Currency", data.currency);
//   pushKey("PaymTermId", data.paymentTerms);
//   pushKey("PaymMode", data.paymentMethod);
//   pushKey("DlvTerm", data.deliveryTerms);
//   pushKey("DlvMode", data.deliveryMode);
//   pushKey("TaxGroup", data.salesTaxGroup);
//   pushKey("LineOfBusinessId", data.lineOfBusiness);
//   pushKey("SegmentId", data.segment);
//   pushKey("SubsegmentId", data.subsegment);
//   pushKey("VATNum", data.trn);
//   pushKey("VATRegistred", data.vatRegistered);
//   pushKey("TradeLicenseNumber", data.tradeLicense);

//   const tlIssueISO = toISODate(data.tlIssueDate);
//   if (tlIssueISO) pushKey("TradeLicenseDateIssue", tlIssueISO);

//   const tlExpiryISO = toISODate(data.tlExpiryDate);
//   if (tlExpiryISO) pushKey("TradeLicenseDateExpiry", tlExpiryISO);

//   const addresses = [
//     {
//       Name: "Primary Address",
//       Country: data.country,
//       City: data.city,
//       State: data.state || "",
//       Street: data.street,
//       ZipCode: data.zipPostalCode || "",
//     },
//   ];

//   const electronicAddresses = [
//     {
//       Description: "Email",
//       Type: "Email",
//       value: data.email,
//       Primary: "Yes",
//     },
//     {
//       Description: "Phone",
//       Type: "Phone",
//       value: `${data.telCountryCode}${data.telephone}`,
//       Primary: "Yes",
//     },
//     {
//       Description: "Mobile",
//       Type: "Phone",
//       value: `${data.mobileCountryCode}${data.mobileNumber}`,
//       Primary: "No",
//     },
//   ];

//   if (data.website) {
//     electronicAddresses.push({
//       Description: "Website",
//       Type: "URL",
//       value: data.website,
//       Primary: "No",
//     });
//   }

//   console.log(keys);

//   const attachments = files.map((file) => d365encodeFileToBase64(file));

//   return {
//     _request: {
//       Type: "Customer",
//       LegalEntity: "MAHY",
//       AccountNum: "C-00000",
//       Keys: keys,
//       Addresses: addresses,
//       ElectronicAddresses: electronicAddresses,
//       Attachments: attachments,
//     },
//   };
// };

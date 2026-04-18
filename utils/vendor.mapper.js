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
  with_trn: {
    trnType: "With TRN",
    vatRegistered: "Yes",
  },
  without_trn: {
    trnType: "Without TRN",
    vatRegistered: "No",
  },
};

const toBoolEnum = (v) => {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") return v.toLowerCase() === "true" ? 1 : 0;
  if (typeof v === "number") return v === 1 ? 1 : 0;
  return 0;
};

export const mapVendorToD365Payload = (data, files = []) => {
  const keys = [];

  const pushKey = (Field, Value) => {
    if (Value !== undefined && Value !== null && Value !== "") {
      keys.push({ Field, Value: String(Value) });
    }
  };

  const isOrganization = data.vendorType === "organization";
  const isPerson = data.vendorType === "person";
  // const isUAE = data.countryRegion === "UAE";
  const isUAE = data.countryRegion === "ARE";

  pushKey("DirPartyBaseType", isOrganization ? "Organization" : "Person");
  if (isOrganization) {
    pushKey("Name", data.companyName);
  } else {
    const personName = [
      data.firstName,
      data.middleName,
      data.lastNamePrefix,
      data.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    pushKey("Name", personName);
  }

  pushKey("VendClassificationId", data.vendorClassificationGroup);
  pushKey("VendGroup", data.vendorClassificationGroup);
  pushKey("Currency", data.currency);

  pushKey("PaymTermId", data.termsOfPayment);
  pushKey("PaymMode", data.methodOfPayment);
  pushKey("DlvTerm", data.deliveryTerms);
  pushKey("DlvMode", data.deliveryMode);

  pushKey("FirstName", data.firstName);
  pushKey("MiddleName", data.middleName);
  pushKey("LastName", data.lastName);

  pushKey("TaxGroup", data.salesTaxGroup);
  pushKey("VATNum", data.taxExemptNumber);

  // if (isOrganization && data.trnType === "with_trn") {
  //   pushKey("TRNType", data.trnType);
  //   pushKey("TRNNumber", data.trn);
  //   pushKey("VATRegistred", 1);
  // } else {
  //   pushKey("VATRegistred", 0);
  // }

  if (isOrganization && data.trnType) {
    const trnCfg = TRN_TYPE_MAP[data.trnType];

    if (!trnCfg) {
      throw new Error(`Invalid TRNType: ${data.trnType}`);
    }

    pushKey("TRNType", trnCfg.trnType);

    pushKey("VATRegistred", trnCfg.vatRegistered);

    if (trnCfg.vatRegistered === "Yes") {
      pushKey("TRNNumber", data.trn);
    }
  }

  if (isOrganization) {
    pushKey("TradeLicenseNumber", data.tradeLicense);

    const tlIssue = toFormattedDate(data.tradeLicenseIssueDate);
    if (tlIssue) pushKey("TradeLicenseDateIssue", tlIssue);

    const tlExpiry = toFormattedDate(data.tradeLicenseExpiryDate);
    if (tlExpiry) pushKey("TradeLicenseDateExpiry", tlExpiry);

    pushKey(
      "OneTimeVendor",
      data.vendorClassificationGroup === "onetime" ? 1 : 0,
    );
    pushKey("CompanyChainId", data.companyChain);
  }

  if (isPerson) {
    pushKey("FirstName", data.firstName);
    pushKey("MiddleName", data.middleName);
    pushKey("LastNamePrefix", data.lastNamePrefix);
    pushKey("LastName", data.lastName);

    if (isUAE) {
      pushKey("EmiratesID", data.emiratesId);

      const eidIssue = toFormattedDate(data.emiratesIdIssueDate);
      if (eidIssue) pushKey("EmiratesIDDateIssue", eidIssue);

      const eidExpiry = toFormattedDate(data.emiratesIdExpiryDate);
      if (eidExpiry) pushKey("EmiratesIDDateExpiry", eidExpiry);
    } else {
      pushKey("PassportNum", data.passportNumber);

      const passIssue = toFormattedDate(data.passportDateOfIssue);
      if (passIssue) pushKey("PassportDateIssue", passIssue);

      const passExpiry = toFormattedDate(data.passportDateOfExpiry);
      if (passExpiry) pushKey("PassportDateExpiry", passExpiry);
    }
  }

  pushKey("LineOfBusinessId", data.lineOfBusiness);
  pushKey("SegmentId", data.segment);
  pushKey("SubsegmentId", data.subsegment);

  const addresses = [
    {
      Name: "Primary Address",
      Country: data.countryRegion,
      City: data.city,
      Street: data.street,
      ZipCode: data.zipPostalCode,
      State: data.state || "",
      MakaniNumber: data.makaniNumber || "",
      AddressBooks: data.addressBooks || "",
      PostBox: data.postBox || "",
      StreetNumber: data.streetNumber || "",
      District: data.district || "",
      BuildingComplement: data.buildingComplement || "",
      County: data.county || "",
    },
  ];

  const electronicAddresses = [];

  if (data.emailAddress) {
    electronicAddresses.push({
      Description: "Email",
      Type: "Email",
      Value: data.emailAddress,
      Primary: "Yes",
    });
  }

  if (data.telNumber) {
    electronicAddresses.push({
      Description: "Phone",
      Type: "Phone",
      Value: `${data.telCountryCode || ""}${data.telNumber}`,
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
      Type: "vendor",
      LegalEntity: data.company || "MAHY",

      AccountNum: data.accountNum,

      Keys: keys,
      Addresses: addresses,
      ElectronicAddresses: electronicAddresses,
      Attachments: attachments,
    },
  };
};

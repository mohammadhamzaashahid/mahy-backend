import { encodeFileToBase64 } from "./uploadHelper.js";

export function mapCustomerComplaintToCrm(form, files = []) {
  const orgPersonMap = {
    Organization: 124620000,
    Person: 124620001,
  };

  const source2Map = {
    phone: 809880003,
    email: 809880003,  
    website: 809880003,
    "walk-in": 809880003, 
    whatsapp: 809880002, 
  };

  const complaintTypeMap = {
    "Quotation Delay": 124620000,
    "Order Processing Delay": 124620001,
    "Wrong Product Sent": 124620002,
    "Incomplete Delivery": 124620003,
    "Damaged Product": 124620004,
    "Product Defect": 124620005,
    "Installation Issue": 124620006,
    "Service Delay": 124620007,
    "Poor Service Quality": 124620008,
    "Billing Error": 124620009,
    "Overcharging": 124620010,
    "Payment Issue": 124620011,
    "Credit Issue": 124620012,
    "No Response to Calls": 124620013,
    "No Response to Emails": 124620014,
    "No Response on WhatsApp": 124620015,
    "Rude Staff Behaviour": 124620016,
    "Miscommunication": 124620017,
    "Incorrect Information": 124620018,
    "Other": 124620019,
  };

  const frequencyMap = {
    once: 124620000,
    intermittent: 124620001,
    frequent: 124620002,
    always: 124620003,
  };

  const issueCategoryMap = {
    quality_issue: 124620000,
    wrong_product: 124620001,
    damaged: 124620002,
    delay: 124620003,
    overcharging: 124620004,
    poor_service: 124620005,
    behaviour: 124620006,
    other: 124620007,
  };

  const severityMap = {
    critical: 124620000,
    high: 124620001,
    medium: 124620002,
    low: 124620003,
  };

  const businessImpactMap = {
    production_stopped: 124620000,
    water_supply_affected: 124620001,
    financial_loss: 124620002,
    inconvenience_only: 124620003,
  };

  const normalizeBusinessImpact = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];

      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [trimmed];
        } catch {
          return [trimmed];
        }
      }

      return [trimmed];
    }

    return [];
  };

  const rawBusinessImpact = form.businessImpact ?? form.mk_businessimpact;
  const normalizedBusinessImpact = normalizeBusinessImpact(rawBusinessImpact);

  const businessImpactValue =
    typeof rawBusinessImpact === "number"
      ? rawBusinessImpact.toString()
      : normalizedBusinessImpact.length
      ? businessImpactMap[normalizedBusinessImpact[0]]?.toString() ??
        (/^\d+$/.test(normalizedBusinessImpact[0])
          ? normalizedBusinessImpact[0]
          : null)
      : null;

  const payload = {
    mk_organizationperson: orgPersonMap[form.customerType],
    mk_companyname: form.companyName,
    mk_contactperson: form.contactPerson || null,
    mk_mobilenumber: form.mobileNumber,

    mah_source2: source2Map[form.source],

    mk_complaintype: complaintTypeMap[form.complaintType],
    mk_productservices: form.productCategory,
    mk_salesperson: form.salesPerson || null,
    mk_brand: form.brand || null,
    mk_model: form.model || null,
    mk_serialno: form.serialNo || null,
    mk_invoiceno: form.invoiceNo || null,

    mk_problemdescription: form.problemDescription,

    mk_incidentdate: form.incidentDate
      ? new Date(form.incidentDate).toISOString()
      : null,

    mk_frequency: form.frequency ? frequencyMap[form.frequency] : null,

    mk_issuecategory: issueCategoryMap[form.issueCategory],
    mk_severitylevel: severityMap[form.severityLevel],

    ...(businessImpactValue ? { mk_businessimpact: businessImpactValue } : {}),
  };

  Object.keys(payload).forEach((k) => {
    if (payload[k] === null || payload[k] === undefined) delete payload[k];
  });

  const isMulterFile = (file) =>
    file &&
    typeof file === "object" &&
    "originalname" in file &&
    "buffer" in file;

  const normalizeFiles = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.reduce(
        (acc, item) => acc.concat(normalizeFiles(item)),
        []
      );
    }
    if (isMulterFile(input)) return [input];
    if (typeof input === "object") {
      return Object.values(input).reduce(
        (acc, value) => acc.concat(normalizeFiles(value)),
        []
      );
    }
    return [];
  };

  const attachments = normalizeFiles(files).map((file) =>
    encodeFileToBase64(file)
  );

  return { crmPayload: payload, attachments };
}

import { crmClient } from "./crmClient.js";

export const createSiteVisitInCRM = async (payload, attachments = []) => {
  const response = await crmClient.post(
    "https://mahkhoorydev.api.crm15.dynamics.com/api/data/v9.2/mah_sitevisitdetails",
    payload
  );

  const entityUrl =
    response.headers["odata-entityid"] ||
    response.headers["OData-EntityId"];

  if (!entityUrl) {
    throw new Error("Missing OData-EntityId header from CRM");
  }

  const recordId = entityUrl.match(/\(([^)]+)\)/)[1];

  for (const file of attachments) {
    const cleanBase64 = file.base64.replace(/^data:.*;base64,/, "");

    await crmClient.post(
      "https://mahkhoorydev.api.crm15.dynamics.com/api/data/v9.2/annotations",
      {
        subject: "Site Visit Attachment",
        filename: file.fileName,
        mimetype: file.mimeType,
        documentbody: cleanBase64,
        objecttypecode: "mah_sitevisitdetail",
        "objectid_mah_sitevisitdetail@odata.bind":
          `/mah_sitevisitdetails(${recordId})`,
      }
    );
  }

  return recordId;
};

import { crmClient } from "../services/crmClient.js";
import { mapCustomerComplaintToCrm } from "../utils/complaintMapper.js";

export async function createCustomerComplaint(req, res) {
  try {
    const formData = req.body;

    const { crmPayload, attachments } = mapCustomerComplaintToCrm(
      formData,
      req.files ?? req.file
    );

    console.log("payload", crmPayload);
    
    const { data, headers } = await crmClient.post(
      "https://mahkhoorydev.api.crm15.dynamics.com/api/data/v9.2/mah_customercomplains",
      crmPayload
    );

    console.log(data);

    const entityUrl =
      headers?.["odata-entityid"] || headers?.["OData-EntityId"] || null;
    const recordId = entityUrl ? entityUrl.match(/\(([^)]+)\)/)?.[1] : null;

    if (recordId && attachments.length) {
      for (const file of attachments) {
        const cleanBase64 = file.base64.replace(/^data:.*;base64,/, "");

        await crmClient.post(
          "https://mahkhoorydev.api.crm15.dynamics.com/api/data/v9.2/annotations",
          {
            subject: "Customer Complaint Attachment",
            filename: file.fileName,
            mimetype: file.mimeType,
            documentbody: cleanBase64,
            objecttypecode: "mah_customercomplain",
            "objectid_mah_customercomplain@odata.bind":
              `/mah_customercomplains(${recordId})`,
          }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Complaint created in CRM",
      entityId: entityUrl,
      crmResponse: data ?? null,
      sentPayload: crmPayload,
    });
  } catch (err) {
    const crmError = err || null;
    const status = err?.response?.status || 500;

    return res.status(status).json({
      success: false,
      message: "Failed to create complaint in CRM",
      error: crmError || err.message,
    });
  }
}

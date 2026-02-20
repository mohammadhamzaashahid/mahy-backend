import { crmClient } from "../services/crmClient.js";
import { mapCustomerComplaintToCrm } from "../utils/complaintMapper.js";

export async function createCustomerComplaint(req, res) {
  try {
    const formData = req.body;

    const crmPayload = mapCustomerComplaintToCrm(formData);

    console.log("payload", crmPayload);
    
    const { data, headers } = await crmClient.post("https://mahkhoorydev.api.crm15.dynamics.com/api/data/v9.2/mah_customercomplains", crmPayload);

    console.log(data);

    const entityId = headers?.["odata-entityid"] || null;

    return res.status(201).json({
      success: true,
      message: "Complaint created in CRM",
      entityId,
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

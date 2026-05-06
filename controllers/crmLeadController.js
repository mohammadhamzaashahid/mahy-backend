import { formatCRMLead } from "../utils/payloadFormatter.js";
import { createLead } from "../services/crmLeadService.js";

export async function submitLead(req, res) {
  try {
    console.log("CRM lead frontend payload:", req.body);

    const formatted = formatCRMLead(req.body);
    console.log("CRM lead formatted payload:", formatted);
    
    const crmResponse = await createLead(formatted);
    console.log("CRM lead response:", crmResponse);
    

    res.json({ success: true, data: crmResponse });
  } catch (err) {
    console.error("CRM ERROR", err.response?.data || err);
    res.status(500).json({ success: false, message: "CRM submission failed" });
  }
}

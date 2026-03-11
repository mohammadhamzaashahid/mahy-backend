import { crmClient } from "./crmClient.js";

export async function createLead(payload) {
  const response = await crmClient.post("https://mahkhoorydev.crm15.dynamics.com/api/data/v9.2/leads", payload);

  return response.data;
}
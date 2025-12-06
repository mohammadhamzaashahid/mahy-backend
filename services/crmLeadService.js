import axios from "axios";
import { getCRMToken } from "./crmAuthService.js";

export async function createLead(payload) {
  const token = await getCRMToken();

  const response = await axios.post(
    `${process.env.CRM_API_BASE}/leads`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }
  );

  return response.data;
}

import axios from "axios";
import { getCRMToken } from "./crmToken.service.js";

export const crmClient = axios.create({
  baseURL: process.env.CRM_ENV_RESOURCE,
  headers: {
    "Content-Type": "application/json",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    Accept: "application/json",
  },

  
});

crmClient.interceptors.request.use(async (config) => {
  const token = await getCRMToken();
  console.log(token);
  
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

import axios from "axios";
import { getD365AccessToken } from "../middlewares/getD365AccessToken.js";
const D365_BASE_URL =
  "https://mkcrpfin68041c165143aff2devaos.axcloud.dynamics.com";

export const d365Client = axios.create({
  baseURL: D365_BASE_URL,
});

d365Client.interceptors.request.use(async (config) => {
  const token = await getD365AccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});
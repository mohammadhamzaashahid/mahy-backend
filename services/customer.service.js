import { d365Client } from "../config/axiosD365.js";

export const createCustomerInD365 = async (payload) => {
console.log("D365 Customer Payload:\n", JSON.stringify(payload, null, 2));
  const { data } = await d365Client.post(
    "https://mkcrpfin68041c165143aff2devaos.axcloud.dynamics.com/api/services/MK_CustVendRequestServiceGroup/MK_CustVendRequestService/create",
    payload,
  );

  return data;
};

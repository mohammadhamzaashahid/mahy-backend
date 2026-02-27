import { mapCustomerToD365Payload } from "../utils/customer.mapper.js";
import { createCustomerInD365 } from "../services/customer.service.js";
import { generateNextCustomerAccountNum } from "../services/accountNum.service.js";

export const createCustomer = async (req, res, next) => {
  try {
    const accountNum = await generateNextCustomerAccountNum();

    const payload = mapCustomerToD365Payload(
      { ...req.body, accountNum },
      req.files
    );

    const response = await createCustomerInD365(payload);

    return res.status(200).json({
      success: true,
      message: "Customer request submitted successfully",
      data: response,
    });
  } catch (error) {
    console.error("D365 CUSTOMER CREATE ERROR:", error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error?.response?.data || error.message,
    });
  }
};


// import { mapCustomerToD365Payload } from "../utils/customer.mapper.js";
// import { createCustomerInD365 } from "../services/customer.service.js";

// export const createCustomer = async (req, res, next) => {
//   try {
//     const payload = mapCustomerToD365Payload(req.body, req.files);

//     const response = await createCustomerInD365(payload);

//     return res.status(200).json({
//       success: true,
//       message: "Customer request submitted successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("D365 CUSTOMER CREATE ERROR:", error?.response?.data || error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create customer",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
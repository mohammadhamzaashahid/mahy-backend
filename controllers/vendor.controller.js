
import { generateNextVendAccountNum } from "../services/accountNum.service.js";
import { createVendorInD365 } from "../services/vendor.service.js";
import { mapVendorToD365Payload } from "../utils/vendor.mapper.js";

export const createVendor = async (req, res, next) => {
  try {
    const accountNum = await generateNextVendAccountNum();

    const payload = mapVendorToD365Payload(
      { ...req.body, accountNum },
      req.files
    );

    const response = await createVendorInD365(payload);

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

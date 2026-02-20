import { mapServiceRequestPayload } from "../utils/serviceRequestMapper.js";
import { createServiceRequestInCRM } from "../services/serviceRequest.service.js";

export const createServiceRequest = async (req, res) => {
  try {
    const { crmPayload, attachments } =
      mapServiceRequestPayload(req.body, req.files);

    const recordId = await createServiceRequestInCRM(
      crmPayload,
      attachments
    );

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      recordId,
    });
  } catch (error) {
    console.error(
      "SERVICE REQUEST ERROR:",
      error?.response?.data || error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create service request",
    });
  }
};

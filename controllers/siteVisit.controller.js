import { mapSiteVisitPayload } from "../utils/siteVisitMapper.js";
import { createSiteVisitInCRM } from "../services/siteVisit.service.js";

export const createSiteVisit = async (req, res) => {
  try {
    const { crmPayload, attachments } = mapSiteVisitPayload(req.body, req.file);

    const recordId = await createSiteVisitInCRM(crmPayload, attachments);

    return res.status(201).json({
      success: true,
      message: "Site visit request created successfully",
      recordId,
    });
  } catch (error) {
    console.error("Site visit request error", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Failed to create site visit request",
    });
  }
};
import { success, error } from "../utils/response.js";
import {
  getAllDocuments,
  updateDocumentStatus,
  createActionLog,
  getDocumentById,
  finalizeDocumentDecision
} from "../services/document.service.js";
import { sendDecisionEmail } from "../config/mailer.js";
import { processDocumentPdf } from "../services/pdfProcessing.service.js";


export const listDocuments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const result = await getAllDocuments({
      status,
      page: Number(page),
      limit: Number(limit),
    });

    return success(res, result);
  } catch (err) {
    console.error(err);
    return error(res);
  }
};


export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body.user;
    const remarks = req.body.remarks || "Approved by GCEO";

    if (!user?.email || !user?.name) {
      return error(res, "Approver details are required", 400);
    }

    const doc = await getDocumentById(id);

    if (!doc) {
      return error(res, "Document not found", 404);
    }

    if (doc.status !== "PENDING") {
      return error(res, `Document is already ${doc.status}`, 400);
    }

    const processed = await processDocumentPdf({
      originalFilePath: doc.originalFilePath,
      originalFileName: doc.originalFileName,
      referenceNo: doc.referenceNo,
      status: "APPROVED",
    });

    await finalizeDocumentDecision({
      id,
      status: "APPROVED",
      actionUser: user,
      decisionRemarks: remarks,
      processedFileName: processed.processedFileName,
      processedFilePath: processed.processedFilePath,
      verificationToken: processed.verificationToken,
      verificationUrl: processed.verificationUrl,
      qrCodePath: processed.qrCodePath,
    });

    await createActionLog(id, "APPROVED", user, remarks);

    // const downloadUrl = `${process.env.APP_BASE_URL}/api/portal/documents/${id}/download`;
const downloadUrl = `${process.env.APP_BASE_URL}/mahy-portal/employee-portal/documents/${id}`;

    await sendDecisionEmail({
      to: doc.uploadedByEmail,
      name: doc.uploadedByName,
      referenceNo: doc.referenceNo,
      status: "APPROVED",
      decisionRemarks: remarks,
      downloadUrl,
    });

    return success(
      res,
      {
        documentId: Number(id),
        status: "APPROVED",
        verificationToken: processed.verificationToken,
      },
      "Document approved successfully"
    );
  } catch (err) {
    console.error(err);
    return error(res, "Approval processing failed");
  }
};



export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body.user;
    const reason = req.body.reason || "Rejected by GCEO";

    if (!user?.email || !user?.name) {
      return error(res, "Approver details are required", 400);
    }

    const doc = await getDocumentById(id);

    if (!doc) {
      return error(res, "Document not found", 404);
    }

    if (doc.status !== "PENDING") {
      return error(res, `Document is already ${doc.status}`, 400);
    }

    const processed = await processDocumentPdf({
      originalFilePath: doc.originalFilePath,
      originalFileName: doc.originalFileName,
      referenceNo: doc.referenceNo,
      status: "REJECTED",
    });

    await finalizeDocumentDecision({
      id,
      status: "REJECTED",
      actionUser: user,
      decisionRemarks: reason,
      processedFileName: processed.processedFileName,
      processedFilePath: processed.processedFilePath,
      verificationToken: null,
      verificationUrl: null,
      qrCodePath: null,
    });

    await createActionLog(id, "REJECTED", user, reason);

    // const downloadUrl = `${process.env.APP_BASE_URL}/api/portal/documents/${id}/download`;
const downloadUrl = `${process.env.APP_BASE_URL}/mahy-portal/employee-portal/documents/${id}`;
    await sendDecisionEmail({
      to: doc.uploadedByEmail,
      name: doc.uploadedByName,
      referenceNo: doc.referenceNo,
      status: "REJECTED",
      decisionRemarks: reason,
      downloadUrl,
    });

    return success(
      res,
      {
        documentId: Number(id),
        status: "REJECTED",
      },
      "Document rejected successfully"
    );
  } catch (err) {
    console.error(err);
    return error(res, "Rejection processing failed");
  }
};


export const bulkApprove = async (req, res) => {
  try {
    const { documentIds, remarks } = req.body;
    const user = req.body.user;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return error(res, "No document IDs provided", 400);
    }

    if (!user?.email || !user?.name) {
      return error(res, "Approver details are required", 400);
    }

    const results = [];

    for (const id of documentIds) {

      const doc = await getDocumentById(id);

      if (!doc || doc.status !== "PENDING") {
        results.push({ id, status: "SKIPPED" });
        continue;
      }

      const processed = await processDocumentPdf({
        originalFilePath: doc.originalFilePath,
        originalFileName: doc.originalFileName,
        referenceNo: doc.referenceNo,
        status: "APPROVED",
      });

      await finalizeDocumentDecision({
        id,
        status: "APPROVED",
        actionUser: user,
        decisionRemarks: remarks || "Bulk approved by GCEO",
        processedFileName: processed.processedFileName,
        processedFilePath: processed.processedFilePath,
        verificationToken: processed.verificationToken,
        verificationUrl: processed.verificationUrl,
        qrCodePath: processed.qrCodePath,
      });

      await createActionLog(id, "APPROVED", user, remarks || "Bulk approved");

      // const downloadUrl = `${process.env.APP_BASE_URL}/api/portal/documents/${id}/download`;
const downloadUrl = `${process.env.APP_BASE_URL}/mahy-portal/employee-portal/documents/${id}`;
      await sendDecisionEmail({
        to: doc.uploadedByEmail,
        name: doc.uploadedByName,
        referenceNo: doc.referenceNo,
        status: "APPROVED",
        decisionRemarks: remarks,
        downloadUrl,
      });

      results.push({ id, status: "APPROVED" });
    }

    return success(res, results, "Bulk approval completed");

  } catch (err) {
    console.error(err);
    return error(res, "Bulk approval failed");
  }
};



export const bulkReject = async (req, res) => {
  try {

    const { documentIds, reason } = req.body;
    const user = req.body.user;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return error(res, "No document IDs provided", 400);
    }

    if (!user?.email || !user?.name) {
      return error(res, "Approver details are required", 400);
    }

    const results = [];

    for (const id of documentIds) {

      const doc = await getDocumentById(id);

      if (!doc || doc.status !== "PENDING") {
        results.push({ id, status: "SKIPPED" });
        continue;
      }

      const processed = await processDocumentPdf({
        originalFilePath: doc.originalFilePath,
        originalFileName: doc.originalFileName,
        referenceNo: doc.referenceNo,
        status: "REJECTED",
      });

      await finalizeDocumentDecision({
        id,
        status: "REJECTED",
        actionUser: user,
        decisionRemarks: reason || "Bulk rejected by GCEO",
        processedFileName: processed.processedFileName,
        processedFilePath: processed.processedFilePath,
        verificationToken: null,
        verificationUrl: null,
        qrCodePath: null,
      });

      await createActionLog(id, "REJECTED", user, reason || "Bulk rejected");

      // const downloadUrl = `${process.env.APP_BASE_URL}/api/portal/documents/${id}/download`;
const downloadUrl = `${process.env.APP_BASE_URL}/mahy-portal/employee-portal/documents/${id}`;
      await sendDecisionEmail({
        to: doc.uploadedByEmail,
        name: doc.uploadedByName,
        referenceNo: doc.referenceNo,
        status: "REJECTED",
        decisionRemarks: reason,
        downloadUrl,
      });

      results.push({ id, status: "REJECTED" });
    }

    return success(res, results, "Bulk rejection completed");

  } catch (err) {
    console.error(err);
    return error(res, "Bulk rejection failed");
  }
};
import express from "express";

import {
  listDocuments,
  approveDocument,
  rejectDocument,
  bulkApprove,
  bulkReject
} from "../controllers/gceoApproval.controller.js";

const router = express.Router();

router.get("/documents", listDocuments);

router.post("/documents/:id/approve", approveDocument);

router.post("/documents/:id/reject", rejectDocument);

router.post("/documents/bulk-approve", bulkApprove);

router.post("/documents/bulk-reject", bulkReject);

export default router;
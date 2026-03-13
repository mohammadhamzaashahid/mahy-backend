import express from "express";

import { uploadDocument, getMyDocuments, downloadDocument } from "../controllers/portalDocument.controller.js";
import { uploadMiddleware } from "../middlewares/file.upload.middleware.js";


const router = express.Router();

router.post(
  "/upload",
  uploadMiddleware.single("file"),
  uploadDocument
);

router.get(
  "/my",
  getMyDocuments
);

router.get("/:id/download", downloadDocument);

export default router;
import express from "express";
import { createServiceRequest } from "../controllers/serviceRequest.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/service-request",
  upload.fields([
    { name: "uploadPhotos", maxCount: 4 },
    { name: "uploadVideo", maxCount: 1 },
    { name: "voiceNote", maxCount: 1 },
    { name: "errorScreenshot", maxCount: 1 },
  ]),
  createServiceRequest,
);

export default router;

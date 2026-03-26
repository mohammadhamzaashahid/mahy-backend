import express from "express";
import { createCustomerComplaint } from "../controllers/customerComplaint.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/customer-complaint",
  upload.any(),
  createCustomerComplaint
);

export default router;

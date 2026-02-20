import express from "express";
import { createCustomerComplaint } from "../controllers/customerComplaint.controller.js";

const router = express.Router();

router.post("/customer-complaint", createCustomerComplaint);

export default router;

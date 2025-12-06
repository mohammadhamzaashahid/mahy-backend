import express from "express";
import { submitLead } from "../controllers/crmLeadController.js";

const router = express.Router();

router.post("/lead/create", submitLead);

export default router;

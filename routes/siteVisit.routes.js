import express from "express";
import { createSiteVisit } from "../controllers/siteVisit.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/site-visit", upload.single("attachFile"), createSiteVisit);

export default router;
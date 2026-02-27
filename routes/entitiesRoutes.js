import express from "express";
import { getCompanies } from "../controllers/entityController.js";


const router = express.Router();

router.get('/legal-entities', getCompanies);

export default router;

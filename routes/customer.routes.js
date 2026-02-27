import express from "express";
import { createCustomer } from "../controllers/customer.controller.js";
import { upload } from "../middlewares/upload.js";


const router = express.Router();

router.post(
  "/customer/create",
  upload.any(), 
  createCustomer,
);

export default router;
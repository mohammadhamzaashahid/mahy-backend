import express from "express";
import { upload } from "../middlewares/upload.js";
import { createVendor } from "../controllers/vendor.controller.js";


const router = express.Router();

router.post(
  "/vend/create",
  upload.any(), 
  createVendor,
);

export default router;
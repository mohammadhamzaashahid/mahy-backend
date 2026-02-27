import express from "express";
import rateLimit from "express-rate-limit";
import { signup, resend, verifyOtp, login } from "../controllers/auth.controller.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/resend-otp", authLimiter, resend);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/login", authLimiter, login);

export default router;
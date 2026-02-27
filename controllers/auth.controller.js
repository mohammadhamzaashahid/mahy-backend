import {
  createPendingUserAndSendOtp,
  resendOtp,
  verifyOtpAndActivate,
  loginUser,
} from "../services/auth.service.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "name, email, password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const result = await createPendingUserAndSendOtp({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    return res.status(result.status).json({
      success: result.ok,
      message: result.message,
    });
  } catch (e) {
    next(e);
  }
}

export async function resend(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const result = await resendOtp({ email: String(email).trim().toLowerCase() });
    return res.status(result.status).json({ success: result.ok, message: result.message });
  } catch (e) {
    next(e);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "email and otp are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const result = await verifyOtpAndActivate({
      email: String(email).trim().toLowerCase(),
      otp: String(otp).trim(),
    });

    return res.status(result.status).json({ success: result.ok, message: result.message });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const result = await loginUser({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    return res.status(result.status).json({
      success: result.ok,
      message: result.message,
      ...(result.data ? { data: result.data } : {}),
    });
  } catch (e) {
    next(e);
  }
}
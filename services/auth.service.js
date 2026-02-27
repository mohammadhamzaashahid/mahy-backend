import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../config/mailer.js";
import { generateOtp, hashOtp, compareOtp } from "../utils/otp.js";
import { getPool } from "../config/mysql.js";

function nowPlusMinutes(min) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + Number(min));
  return d;
}

export async function createPendingUserAndSendOtp({ name, email, password }) {
  const pool = await getPool();

  const password_hash = await bcrypt.hash(password, 12);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query("SELECT id, is_verified FROM users WHERE email = ?", [email]);
    if (existing.length) {
      const user = existing[0];
      if (user.is_verified === 1) {
        return { ok: false, status: 409, message: "Email already registered. Please login." };
      }

      await conn.commit();
      return { ok: true, status: 200, message: "Account exists but not verified. Use resend OTP." };
    }

    const [ins] = await conn.query(
      "INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 0)",
      [name, email, password_hash]
    );

    const userId = ins.insertId;

    // create otp
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    const expiresAt = nowPlusMinutes(process.env.OTP_EXPIRES_MINUTES || 10);

    await conn.query(
      "INSERT INTO user_email_otps (user_id, otp_hash, expires_at, attempts_left) VALUES (?, ?, ?, 5)",
      [userId, otpHash, expiresAt]
    );

    await conn.commit();

    await sendOtpEmail({ to: email, name, otp });

    return { ok: true, status: 201, message: "OTP sent to email. Please verify." };
  } catch (e) {
    await conn.rollback();
    if (String(e?.code) === "ER_DUP_ENTRY") {
      return { ok: false, status: 409, message: "Email already registered." };
    }
    throw e;
  } finally {
    conn.release();
  }
}

export async function resendOtp({ email }) {
  const pool = await getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [urows] = await conn.query("SELECT id, name, is_verified FROM users WHERE email = ?", [email]);
    if (!urows.length) return { ok: false, status: 404, message: "User not found" };

    const user = urows[0];
    if (user.is_verified === 1) return { ok: false, status: 400, message: "User already verified. Please login." };

    await conn.query("DELETE FROM user_email_otps WHERE user_id = ?", [user.id]);

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = nowPlusMinutes(process.env.OTP_EXPIRES_MINUTES || 10);

    await conn.query(
      "INSERT INTO user_email_otps (user_id, otp_hash, expires_at, attempts_left) VALUES (?, ?, ?, 5)",
      [user.id, otpHash, expiresAt]
    );

    await conn.commit();

    await sendOtpEmail({ to: email, name: user.name, otp });

    return { ok: true, status: 200, message: "OTP resent." };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function verifyOtpAndActivate({ email, otp }) {
  const pool = await getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [urows] = await conn.query("SELECT id, email, is_verified FROM users WHERE email = ?", [email]);
    if (!urows.length) return { ok: false, status: 404, message: "User not found" };

    const user = urows[0];
    if (user.is_verified === 1) return { ok: true, status: 200, message: "Already verified." };

    const [orows] = await conn.query(
      "SELECT id, otp_hash, expires_at, attempts_left FROM user_email_otps WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [user.id]
    );

    if (!orows.length) return { ok: false, status: 400, message: "OTP not found. Please resend OTP." };

    const otpRow = orows[0];

    // expiry check
    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      await conn.query("DELETE FROM user_email_otps WHERE id = ?", [otpRow.id]);
      await conn.commit();
      return { ok: false, status: 400, message: "OTP expired. Please resend OTP." };
    }

    if (otpRow.attempts_left <= 0) {
      await conn.commit();
      return { ok: false, status: 429, message: "Too many attempts. Please resend OTP." };
    }

    const match = await compareOtp(otp, otpRow.otp_hash);
    if (!match) {
      await conn.query(
        "UPDATE user_email_otps SET attempts_left = attempts_left - 1 WHERE id = ?",
        [otpRow.id]
      );
      await conn.commit();
      return { ok: false, status: 400, message: "Invalid OTP." };
    }

    // mark verified
    await conn.query("UPDATE users SET is_verified = 1 WHERE id = ?", [user.id]);
    // delete OTP
    await conn.query("DELETE FROM user_email_otps WHERE user_id = ?", [user.id]);

    await conn.commit();

    return { ok: true, status: 200, message: "Email verified successfully." };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function loginUser({ email, password }) {
  const pool = await getPool();

  const [rows] = await pool.query(
    "SELECT id, email, name, password_hash, is_verified FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) return { ok: false, status: 401, message: "Invalid email or password" };

  const user = rows[0];

  if (user.is_verified !== 1) {
    return { ok: false, status: 403, message: "Email not verified. Please verify OTP." };
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { ok: false, status: 401, message: "Invalid email or password" };

  const token = jwt.sign(
    { sub: String(user.id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    ok: true,
    status: 200,
    message: "Login successful",
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    },
  };
}
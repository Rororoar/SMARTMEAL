const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const OtpToken = require("../models/OtpToken");
const { ensureOtpEmailReady, sendOtpEmail } = require("./emailService");
const { normalizeEmail } = require("../utils/email");

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function ensureOtpStorageReady() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("Database is not connected. OTP cannot be created or verified yet.");
    error.statusCode = 503;
    throw error;
  }
}

async function issueOtp(email, purpose) {
  ensureOtpEmailReady();
  ensureOtpStorageReady();

  const normalizedEmail = normalizeEmail(email);
  const code = createOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpToken.updateMany(
    { email: normalizedEmail, purpose, consumedAt: { $exists: false } },
    { $set: { consumedAt: new Date() } }
  );

  await OtpToken.create({
    email: normalizedEmail,
    purpose,
    codeHash,
    expiresAt
  });

  return sendOtpEmail({ to: normalizedEmail, code, purpose });
}

async function verifyOtp(email, purpose, code) {
  ensureOtpStorageReady();

  const normalizedEmail = normalizeEmail(email);
  const token = await OtpToken.findOne({
    email: normalizedEmail,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!token) {
    throw otpError("OTP is invalid or expired");
  }

  if (token.attempts >= 5) {
    token.consumedAt = new Date();
    await token.save();
    throw otpError("OTP has too many failed attempts. Request a new code.");
  }

  const valid = await bcrypt.compare(String(code || ""), token.codeHash);

  if (!valid) {
    token.attempts += 1;
    await token.save();
    throw otpError("OTP is incorrect");
  }

  token.consumedAt = new Date();
  await token.save();
  return true;
}

module.exports = {
  issueOtp,
  verifyOtp
};

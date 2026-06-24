const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");
const asyncHandler = require("../utils/asyncHandler");
const createToken = require("../utils/token");
const { isValidEmail, normalizeEmail } = require("../utils/email");
const { issueOtp, verifyOtp } = require("../services/otpService");

function authResponse(user) {
  return {
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
}

function ensureDatabaseReady() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("Database is not connected. Try again after the backend reconnects to MongoDB.");
    error.statusCode = 503;
    throw error;
  }
}

const register = asyncHandler(async (req, res) => {
  const { name, password, otp } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  if (!otp) {
    res.status(400);
    throw new Error("OTP is required to create an account");
  }

  ensureDatabaseReady();

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  await verifyOtp(email, "register", otp);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  await Profile.create({ user: user._id });

  res.status(201).json(authResponse(user));
});

const requestRegistrationOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  ensureDatabaseReady();

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const result = await issueOtp(email, "register");
  res.json({
    message: result.delivered ? "OTP sent to your email." : "OTP generated. Check backend logs in development.",
    devOtp: result.devOtp
  });
});

const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  ensureDatabaseReady();

  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!valid) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json(authResponse(user));
});

const requestPasswordOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  ensureDatabaseReady();

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No account exists for that email");
  }

  const result = await issueOtp(email, "password_reset");
  res.json({
    message: result.delivered ? "Password reset OTP sent to your email." : "OTP generated. Check backend logs in development.",
    devOtp: result.devOtp
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, newPassword } = req.body;

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Enter a valid email address");
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  ensureDatabaseReady();

  await verifyOtp(email, "password_reset", otp);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await User.findOneAndUpdate({ email }, { $set: { passwordHash } }, { new: true });

  if (!user) {
    res.status(404);
    throw new Error("No account exists for that email");
  }

  res.json({ message: "Password updated. You can log in with the new password." });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  ensureDatabaseReady();

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (currentPassword) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }
  } else if (otp) {
    await verifyOtp(user.email, "password_reset", otp);
  } else {
    res.status(400);
    throw new Error("Enter current password or OTP");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ message: "Password changed." });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = {
  requestRegistrationOtp,
  register,
  login,
  requestPasswordOtp,
  resetPassword,
  changePassword,
  me
};

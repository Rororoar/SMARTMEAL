const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Profile = require("../models/Profile");
const asyncHandler = require("../utils/asyncHandler");
const createToken = require("../utils/token");

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

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  await Profile.create({ user: user._id });

  res.status(201).json(authResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!valid) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json(authResponse(user));
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

module.exports = { register, login, me };


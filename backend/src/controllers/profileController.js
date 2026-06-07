const Profile = require("../models/Profile");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );

  res.json({
    profile,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "dietaryPreferences",
    "healthGoals",
    "allergies",
    "dislikedIngredients",
    "preferredIngredients",
    "targetCalories",
    "targetProtein",
    "maxReadyTime",
    "mealsPerDay"
  ];

  const update = allowed.reduce((acc, key) => {
    if (req.body[key] !== undefined) acc[key] = req.body[key];
    return acc;
  }, {});

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { upsert: true, new: true, runValidators: true }
  );

  let user = req.user;

  if (typeof req.body.name === "string" && req.body.name.trim()) {
    user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: req.body.name.trim() } },
      { new: true, runValidators: true }
    );
  }

  res.json({
    profile,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

module.exports = { getProfile, updateProfile };

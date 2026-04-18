const Profile = require("../models/Profile");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );

  res.json({ profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "dietaryPreferences",
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

  res.json({ profile });
});

module.exports = { getProfile, updateProfile };


const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    dietaryPreferences: {
      type: [String],
      default: []
    },
    allergies: {
      type: [String],
      default: []
    },
    dislikedIngredients: {
      type: [String],
      default: []
    },
    preferredIngredients: {
      type: [String],
      default: []
    },
    targetCalories: {
      type: Number,
      default: 2000
    },
    targetProtein: {
      type: Number,
      default: 90
    },
    maxReadyTime: {
      type: Number,
      default: 60
    },
    mealsPerDay: {
      type: [String],
      default: ["lunch", "dinner"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);


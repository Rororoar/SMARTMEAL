const mongoose = require("mongoose");

const savedRecipeSchema = new mongoose.Schema(
  {
    spoonacularId: { type: Number, required: true },
    title: { type: String, required: true },
    image: String,
    readyInMinutes: Number,
    servings: Number,
    sourceUrl: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    savedRecipes: [savedRecipeSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String
  },
  { _id: false }
);

const ingredientSchema = new mongoose.Schema(
  {
    name: String,
    amount: Number,
    unit: String
  },
  { _id: false }
);

const mealItemSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealType: { type: String, required: true },
    recipe: {
      spoonacularId: Number,
      title: String,
      image: String,
      readyInMinutes: Number,
      servings: Number,
      sourceUrl: String,
      summary: String,
      instructions: String,
      steps: [
        {
          number: Number,
          step: String
        }
      ],
      nutrition: nutritionSchema,
      ingredients: [ingredientSchema]
    }
  },
  { timestamps: true }
);

const groceryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    purchased: { type: Boolean, default: false },
    sourceRecipes: { type: [String], default: [] }
  },
  { timestamps: true }
);

const prepTaskSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealType: String,
    label: { type: String, required: true },
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    weekStart: {
      type: Date,
      required: true
    },
    weekEnd: {
      type: Date,
      required: true
    },
    meals: [mealItemSchema],
    groceryItems: [groceryItemSchema],
    prepTasks: [prepTaskSchema]
  },
  { timestamps: true }
);

mealPlanSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("MealPlan", mealPlanSchema);

const MealPlan = require("../models/MealPlan");
const asyncHandler = require("../utils/asyncHandler");

const listForPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOne({ _id: req.params.planId, user: req.user._id }).lean();

  if (!mealPlan) {
    res.status(404);
    throw new Error("Meal plan not found");
  }

  res.json({
    planId: mealPlan._id,
    groceryItems: mealPlan.groceryItems,
    prepTasks: mealPlan.prepTasks
  });
});

module.exports = { listForPlan };


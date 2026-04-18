const MealPlan = require("../models/MealPlan");
const Profile = require("../models/Profile");
const asyncHandler = require("../utils/asyncHandler");
const { buildGroceryList } = require("../services/groceryService");
const { generateWeeklyPlan, parseWeekStart } = require("../services/mealPlannerService");

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const generate = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { upsert: true, new: true }
  );

  const planData = await generateWeeklyPlan(profile, req.body.weekStart);

  const plan = await MealPlan.findOneAndUpdate(
    { user: req.user._id, weekStart: planData.weekStart },
    { ...planData, user: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(201).json({ mealPlan: plan });
});

const current = asyncHandler(async (req, res) => {
  const weekStart = parseWeekStart(req.query.weekStart);
  const mealPlan = await MealPlan.findOne({ user: req.user._id, weekStart });

  res.json({ mealPlan });
});

const show = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id });

  if (!mealPlan) {
    res.status(404);
    throw new Error("Meal plan not found");
  }

  res.json({ mealPlan });
});

const history = asyncHandler(async (req, res) => {
  const mealPlans = await MealPlan.find({ user: req.user._id })
    .sort({ weekStart: -1 })
    .limit(10)
    .lean();

  res.json({ mealPlans });
});

const addRecipeToCurrent = asyncHandler(async (req, res) => {
  const { recipe, date, mealType = "dinner", weekStart: weekStartValue } = req.body;

  if (!recipe?.spoonacularId || !recipe?.title) {
    res.status(400);
    throw new Error("Recipe id and title are required");
  }

  const weekStart = parseWeekStart(weekStartValue);
  const weekEnd = addDays(weekStart, 6);
  const mealDate = date ? new Date(date) : new Date();

  const mealPlan = await MealPlan.findOneAndUpdate(
    { user: req.user._id, weekStart },
    {
      $setOnInsert: {
        user: req.user._id,
        weekStart,
        weekEnd,
        meals: [],
        groceryItems: [],
        prepTasks: []
      }
    },
    { upsert: true, new: true }
  );

  const alreadyAdded = mealPlan.meals.some(
    (meal) => meal.recipe?.spoonacularId === Number(recipe.spoonacularId)
  );

  if (!alreadyAdded) {
    mealPlan.meals.push({
      date: mealDate,
      mealType,
      recipe
    });

    mealPlan.prepTasks.push({
      date: mealDate,
      mealType,
      label: `Prepare ${recipe.title} ingredients for ${mealType}`,
      done: false
    });
  }

  mealPlan.groceryItems = buildGroceryList(mealPlan.meals);
  await mealPlan.save();

  res.status(alreadyAdded ? 200 : 201).json({
    mealPlan,
    message: alreadyAdded ? "Recipe is already in this week's plan." : "Recipe added to this week's plan."
  });
});

const toggleGroceryItem = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!mealPlan) {
    res.status(404);
    throw new Error("Meal plan not found");
  }

  const item = mealPlan.groceryItems.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Grocery item not found");
  }

  item.purchased = req.body.purchased ?? !item.purchased;
  await mealPlan.save();
  res.json({ mealPlan });
});

const togglePrepTask = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOne({ _id: req.params.id, user: req.user._id });
  if (!mealPlan) {
    res.status(404);
    throw new Error("Meal plan not found");
  }

  const task = mealPlan.prepTasks.id(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error("Prep task not found");
  }

  task.done = req.body.done ?? !task.done;
  await mealPlan.save();
  res.json({ mealPlan });
});

module.exports = {
  generate,
  current,
  show,
  history,
  addRecipeToCurrent,
  toggleGroceryItem,
  togglePrepTask
};

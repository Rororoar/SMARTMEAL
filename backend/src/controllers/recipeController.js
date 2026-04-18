const User = require("../models/User");
const Profile = require("../models/Profile");
const asyncHandler = require("../utils/asyncHandler");
const { searchRecipes, getRecipeInformation } = require("../services/spoonacularService");

const search = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).lean();

  const recipes = await searchRecipes({
    query: req.query.query,
    cuisine: req.query.cuisine,
    diet: req.query.diet || profile?.dietaryPreferences?.[0],
    intolerances: req.query.intolerances || profile?.allergies?.join(","),
    excludeIngredients: req.query.excludeIngredients || profile?.dislikedIngredients?.join(","),
    maxReadyTime: req.query.maxReadyTime || profile?.maxReadyTime,
    number: req.query.number || 12,
    offset: req.query.offset || 0
  });

  res.json({ recipes });
});

const show = asyncHandler(async (req, res) => {
  const recipe = await getRecipeInformation(req.params.id);
  res.json({ recipe });
});

const saveRecipe = asyncHandler(async (req, res) => {
  const { spoonacularId, title, image, readyInMinutes, servings, sourceUrl } = req.body;

  if (!spoonacularId || !title) {
    res.status(400);
    throw new Error("Recipe id and title are required");
  }

  const user = await User.findById(req.user._id);
  const exists = user.savedRecipes.some((recipe) => recipe.spoonacularId === Number(spoonacularId));

  if (!exists) {
    user.savedRecipes.push({ spoonacularId, title, image, readyInMinutes, servings, sourceUrl });
    await user.save();
  }

  res.status(201).json({ savedRecipes: user.savedRecipes });
});

const listSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  res.json({ savedRecipes: user.savedRecipes || [] });
});

const removeSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.savedRecipes = user.savedRecipes.filter(
    (recipe) => recipe.spoonacularId !== Number(req.params.id)
  );
  await user.save();
  res.json({ savedRecipes: user.savedRecipes });
});

module.exports = {
  search,
  show,
  saveRecipe,
  listSaved,
  removeSaved
};


const crypto = require("crypto");
const RecipeCache = require("../models/RecipeCache");
const fallbackRecipes = require("./fallbackRecipes");

const BASE_URL = "https://api.spoonacular.com";

function stableCacheKey(endpoint, params) {
  const sorted = Object.keys(cleanParams(params))
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        acc[key] = params[key];
      }
      return acc;
    }, {});

  return crypto
    .createHash("sha256")
    .update(`${endpoint}:${JSON.stringify(sorted)}`)
    .digest("hex");
}

function cleanParams(params) {
  return Object.keys(params).reduce((acc, key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = String(value);
    }
    return acc;
  }, {});
}

function nutrientAmount(recipe, name) {
  const nutrients = recipe?.nutrition?.nutrients || [];
  const match = nutrients.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (!match) return undefined;
  return Math.round(match.amount);
}

function nutrientText(recipe, name) {
  const nutrients = recipe?.nutrition?.nutrients || [];
  const match = nutrients.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (!match) return undefined;
  return match.unit ? `${Math.round(match.amount)}${match.unit}` : String(Math.round(match.amount));
}

function normalizeRecipe(recipe) {
  const analyzedSteps = recipe.analyzedInstructions?.flatMap((instruction) => instruction.steps || []) || [];
  const plainInstructions = recipe.instructions
    ? recipe.instructions
        .replace(/<[^>]+>/g, "")
        .split(/\.\s+/)
        .map((step) => step.trim())
        .filter(Boolean)
    : [];
  const ingredientNames = (recipe.extendedIngredients || [])
    .slice(0, 4)
    .map((ingredient) => ingredient.nameClean || ingredient.name || ingredient.originalName)
    .filter(Boolean);
  const fallbackSteps = [
    `Prepare the ingredients${ingredientNames.length ? `: ${ingredientNames.join(", ")}` : ""}.`,
    "Wash, trim and cut the ingredients before cooking.",
    "Cook the main ingredients over medium heat until they are tender and safe to eat.",
    "Combine the cooked ingredients, season to taste and adjust the texture if needed.",
    "Serve warm and store leftovers in a sealed container."
  ];

  return {
    spoonacularId: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings,
    sourceUrl: recipe.sourceUrl,
    summary: recipe.summary ? recipe.summary.replace(/<[^>]+>/g, "") : "",
    instructions: recipe.instructions ? recipe.instructions.replace(/<[^>]+>/g, "") : "",
    steps: analyzedSteps.length
      ? analyzedSteps.map((step) => ({
          number: step.number,
          step: step.step
        }))
      : (plainInstructions.length ? plainInstructions : fallbackSteps).map((step, index) => ({
          number: index + 1,
          step: step.endsWith(".") ? step : `${step}.`
        })),
    nutrition: {
      calories: nutrientAmount(recipe, "Calories"),
      protein: nutrientText(recipe, "Protein"),
      carbs: nutrientText(recipe, "Carbohydrates"),
      fat: nutrientText(recipe, "Fat")
    },
    ingredients: (recipe.extendedIngredients || []).map((ingredient) => ({
      name: ingredient.nameClean || ingredient.name || ingredient.originalName,
      amount: Number(ingredient.amount || 0),
      unit: ingredient.unit || ""
    }))
  };
}

function fallbackSearch({ query = "", number = 10 } = {}) {
  const lowerQuery = query.toLowerCase();
  const results = fallbackRecipes.filter((recipe) => {
    if (!lowerQuery) return true;
    return recipe.title.toLowerCase().includes(lowerQuery) || recipe.summary.toLowerCase().includes(lowerQuery);
  });

  return {
    results: (results.length ? results : fallbackRecipes).slice(0, Number(number) || 10)
  };
}

async function getCachedData(cacheKey) {
  try {
    const cached = await RecipeCache.findOne({
      cacheKey,
      expiresAt: { $gt: new Date() }
    }).lean();
    return cached?.data;
  } catch (error) {
    return null;
  }
}

async function setCachedData(cacheKey, data, ttlMinutes) {
  try {
    await RecipeCache.findOneAndUpdate(
      { cacheKey },
      {
        cacheKey,
        data,
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000)
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    // Cache failures should not block the app.
  }
}

async function spoonacularGet(endpoint, params = {}, ttlMinutes = 720) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const cacheKey = stableCacheKey(endpoint, params);
  const cached = await getCachedData(cacheKey);

  if (cached) {
    return cached;
  }

  if (!apiKey) {
    if (endpoint === "/recipes/complexSearch") {
      return fallbackSearch(params);
    }
    const fallbackId = Number(endpoint.match(/\/recipes\/(\d+)\/information/)?.[1]);
    return fallbackRecipes.find((recipe) => recipe.id === fallbackId) || fallbackRecipes[0];
  }

  const search = new URLSearchParams(cleanParams({ ...params, apiKey }));

  const response = await fetch(`${BASE_URL}${endpoint}?${search.toString()}`);
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  let data;

  if (contentType.includes("application/json")) {
    data = JSON.parse(rawBody);
  } else {
    throw new Error(`Spoonacular returned ${response.status} ${response.statusText || "response"}. Try again in a moment.`);
  }

  if (!response.ok) {
    const message = data?.message || data?.status || "Spoonacular request failed";
    throw new Error(message);
  }

  await setCachedData(cacheKey, data, ttlMinutes);
  return data;
}

async function searchRecipes(filters = {}) {
  const ttl = Number(process.env.SPOONACULAR_CACHE_TTL_MINUTES || 720);
  const data = await spoonacularGet(
    "/recipes/complexSearch",
    {
      query: filters.query || "healthy",
      cuisine: filters.cuisine,
      diet: filters.diet,
      intolerances: filters.intolerances,
      excludeIngredients: filters.excludeIngredients,
      maxReadyTime: filters.maxReadyTime,
      minProtein: filters.minProtein,
      maxCalories: filters.maxCalories,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      fillIngredients: true,
      instructionsRequired: true,
      number: filters.number || 12,
      offset: filters.offset || 0
    },
    ttl
  );

  return (data.results || []).map(normalizeRecipe);
}

async function getRecipeInformation(id) {
  const ttl = Number(process.env.SPOONACULAR_CACHE_TTL_MINUTES || 720);
  const data = await spoonacularGet(
    `/recipes/${id}/information`,
    {
      includeNutrition: true
    },
    ttl
  );

  return normalizeRecipe(data);
}

module.exports = {
  searchRecipes,
  getRecipeInformation,
  normalizeRecipe
};

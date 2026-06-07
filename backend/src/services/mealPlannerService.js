const fallbackRecipes = require("./fallbackRecipes");
const { searchRecipes, normalizeRecipe } = require("./spoonacularService");
const { buildGroceryList } = require("./groceryService");

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const result = parseCalendarDate(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, days) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

function parseCalendarDate(value) {
  if (value instanceof Date) {
    return new Date(value);
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return new Date(value);
}

function parseWeekStart(value) {
  if (value) return startOfDay(value);
  const today = startOfDay(new Date());
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(today, diffToMonday);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeList(values) {
  return Array.isArray(values) ? values.map(normalizeText).filter(Boolean) : [];
}

function profileDiet(profile) {
  const preferences = normalizeList(profile.dietaryPreferences);

  if (preferences.includes("vegan")) return "vegan";
  if (preferences.includes("vegetarian")) return "vegetarian";
  if (preferences.includes("keto") || preferences.includes("ketogenic")) return "ketogenic";
  if (preferences.includes("paleo")) return "paleo";
  return undefined;
}

function profileIntolerances(profile) {
  const preferences = normalizeList(profile.dietaryPreferences);
  const allergies = normalizeList(profile.allergies);
  const intolerances = new Set(allergies);

  if (preferences.includes("gluten-free") || preferences.includes("gluten free")) {
    intolerances.add("gluten");
  }

  if (preferences.includes("dairy-free") || preferences.includes("dairy free")) {
    intolerances.add("dairy");
  }

  return [...intolerances];
}

function profileCalories(profile) {
  const goals = normalizeList(profile.healthGoals);
  const baseCalories = Math.round((profile.targetCalories || 2000) / 2);

  if (goals.includes("weight loss")) {
    return Math.max(300, Math.round(baseCalories * 0.8));
  }

  if (goals.includes("muscle gain")) {
    return Math.round(baseCalories * 1.1);
  }

  return baseCalories;
}

function profileProtein(profile) {
  const goals = normalizeList(profile.healthGoals);
  const baseProtein = Math.max(10, Math.round((profile.targetProtein || 80) / 8));

  if (goals.includes("muscle gain")) {
    return Math.max(baseProtein, 25);
  }

  return baseProtein;
}

function profileToRecipeFilters(profile, number, relaxed = false) {
  const preferences = normalizeList(profile.preferredIngredients);
  const excluded = [...profileIntolerances(profile), ...normalizeList(profile.dislikedIngredients)];
  const query = profile.preferredIngredients?.length
    ? profile.preferredIngredients.slice(0, 3).join(" ")
    : "healthy meal";

  const baseFilters = {
    query,
    diet: profileDiet(profile),
    intolerances: profileIntolerances(profile).join(","),
    excludeIngredients: excluded.join(","),
    maxReadyTime: profile.maxReadyTime || 60,
    number
  };

  if (relaxed) {
    return {
      ...baseFilters,
      query: "healthy meal"
    };
  }

  return {
    ...baseFilters,
    minProtein: profileProtein(profile),
    maxCalories: profileCalories(profile),
    includeIngredients: preferences.join(",")
  };
}

function recipeContainsBlockedTerm(recipe, blockedTerms) {
  if (!blockedTerms.length) return false;

  const haystack = [
    recipe.title,
    recipe.summary,
    ...(recipe.ingredients || []).map((ingredient) => ingredient.name)
  ]
    .map(normalizeText)
    .join(" ");

  return blockedTerms.some((term) => haystack.includes(term));
}

function expandedBlockedTerms(profile) {
  const baseTerms = [...profileIntolerances(profile), ...normalizeList(profile.dislikedIngredients)];
  const preferences = normalizeList(profile.dietaryPreferences);
  const blocked = new Set(baseTerms);

  if (baseTerms.includes("dairy") || preferences.includes("dairy-free") || preferences.includes("dairy free")) {
    ["milk", "cheese", "butter", "cream", "yogurt", "yoghurt"].forEach((term) => blocked.add(term));
  }

  if (baseTerms.includes("gluten") || preferences.includes("gluten-free") || preferences.includes("gluten free")) {
    ["wheat", "flour", "bread", "pasta", "breadcrumb", "breadcrumbs"].forEach((term) => blocked.add(term));
  }

  if (preferences.includes("vegetarian") || preferences.includes("vegan")) {
    ["chicken", "turkey", "beef", "steak", "pork", "bacon", "ham", "lamb", "mutton", "salmon", "fish", "tuna", "shrimp", "prawn"].forEach((term) =>
      blocked.add(term)
    );
  }

  if (preferences.includes("vegan")) {
    ["egg", "milk", "cheese", "butter", "cream", "yogurt", "yoghurt", "honey"].forEach((term) => blocked.add(term));
  }

  return [...blocked];
}

function filterRecipesForProfile(recipes, profile) {
  const blockedTerms = expandedBlockedTerms(profile);
  return recipes.filter((recipe) => !recipeContainsBlockedTerm(recipe, blockedTerms));
}

function uniqueRecipes(recipes) {
  const seen = new Set();

  return recipes.filter((recipe) => {
    const key = Number(recipe?.spoonacularId || recipe?.id || 0);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function searchSafeRecipes(profile, slots) {
  const recipeCount = Math.max(slots * 2, 18);
  const attempts = [
    () => searchRecipes(profileToRecipeFilters(profile, recipeCount, false)),
    () => searchRecipes(profileToRecipeFilters(profile, recipeCount, true)),
    async () => fallbackRecipes.map(normalizeRecipe)
  ];

  const collectedRecipes = [];
  let lastError;

  for (const attempt of attempts) {
    try {
      const recipes = await attempt();
      const safeRecipes = filterRecipesForProfile(recipes, profile);

      if (safeRecipes.length) {
        collectedRecipes.push(...safeRecipes);
        if (uniqueRecipes(collectedRecipes).length >= Math.min(slots, 7)) {
          break;
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  const uniqueSafeRecipes = uniqueRecipes(collectedRecipes);

  if (uniqueSafeRecipes.length) {
    return uniqueSafeRecipes;
  }

  if (lastError) {
    throw new Error(`Meal generation failed: ${lastError.message}`);
  }

  throw new Error("No recipes were found for this profile. Try fewer filters.");
}

function createPrepTasks(meals) {
  return meals.map((meal) => ({
    date: meal.date,
    mealType: meal.mealType,
    label: `Prepare ${meal.recipe.title} ingredients for ${meal.mealType}`,
    done: false
  }));
}

function recipeIndexForSlot(dayIndex, slotIndex, recipeCount) {
  if (recipeCount <= 1) {
    return 0;
  }

  return (dayIndex + slotIndex * 2) % recipeCount;
}

async function generateWeeklyPlan(profile, weekStartValue) {
  const weekStart = parseWeekStart(weekStartValue);
  const weekEnd = addDays(weekStart, 6);
  const configuredMealTypes = profile.mealsPerDay?.length
    ? profile.mealsPerDay.map(normalizeText).filter(Boolean)
    : ["breakfast", "lunch", "dinner"];
  const mealTypes = configuredMealTypes.length ? configuredMealTypes : ["breakfast", "lunch", "dinner"];
  const slots = 7 * mealTypes.length;
  const safeRecipes = await searchSafeRecipes(profile, slots);

  const meals = [];

  for (let day = 0; day < 7; day += 1) {
    mealTypes.forEach((mealType, slotIndex) => {
      const recipe = safeRecipes[recipeIndexForSlot(day, slotIndex, safeRecipes.length)];

      meals.push({
        date: addDays(weekStart, day),
        mealType,
        recipe
      });
    });
  }

  return {
    weekStart,
    weekEnd,
    meals,
    groceryItems: buildGroceryList(meals),
    prepTasks: createPrepTasks(meals)
  };
}

module.exports = {
  generateWeeklyPlan,
  parseCalendarDate,
  parseWeekStart
};

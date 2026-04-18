const { searchRecipes } = require("./spoonacularService");
const { buildGroceryList } = require("./groceryService");

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date, days) {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

function parseWeekStart(value) {
  if (value) return startOfDay(value);
  const today = startOfDay(new Date());
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(today, diffToMonday);
}

function profileToRecipeFilters(profile, number) {
  const diet = profile.dietaryPreferences?.[0] || undefined;
  const query = profile.preferredIngredients?.length
    ? profile.preferredIngredients.slice(0, 2).join(" ")
    : "healthy meal";

  return {
    query,
    diet,
    intolerances: profile.allergies?.join(","),
    excludeIngredients: profile.dislikedIngredients?.join(","),
    maxReadyTime: profile.maxReadyTime || 60,
    minProtein: Math.max(10, Math.round((profile.targetProtein || 80) / 8)),
    maxCalories: Math.round((profile.targetCalories || 2000) / 2),
    number
  };
}

function createPrepTasks(meals) {
  return meals.map((meal) => ({
    date: meal.date,
    mealType: meal.mealType,
    label: `Prepare ${meal.recipe.title} ingredients for ${meal.mealType}`,
    done: false
  }));
}

async function generateWeeklyPlan(profile, weekStartValue) {
  const weekStart = parseWeekStart(weekStartValue);
  const weekEnd = addDays(weekStart, 6);
  const mealTypes = profile.mealsPerDay?.length ? profile.mealsPerDay : ["lunch", "dinner"];
  const slots = 7 * mealTypes.length;
  const recipes = await searchRecipes(profileToRecipeFilters(profile, Math.max(slots, 12)));

  if (!recipes.length) {
    throw new Error("No recipes were found for this profile. Try fewer filters.");
  }

  const meals = [];
  let recipeIndex = 0;

  for (let day = 0; day < 7; day += 1) {
    mealTypes.forEach((mealType) => {
      meals.push({
        date: addDays(weekStart, day),
        mealType,
        recipe: recipes[recipeIndex % recipes.length]
      });
      recipeIndex += 1;
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
  parseWeekStart
};


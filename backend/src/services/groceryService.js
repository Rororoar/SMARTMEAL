function normalizeIngredientKey(ingredient) {
  return `${ingredient.name || "ingredient"}:${ingredient.unit || ""}`.toLowerCase();
}

function buildGroceryList(meals) {
  const grouped = new Map();

  meals.forEach((meal) => {
    (meal.recipe?.ingredients || []).forEach((ingredient) => {
      if (!ingredient.name) return;

      const key = normalizeIngredientKey(ingredient);
      const existing = grouped.get(key) || {
        name: ingredient.name,
        amount: 0,
        unit: ingredient.unit || "",
        purchased: false,
        sourceRecipes: []
      };

      existing.amount += Number(ingredient.amount || 0);
      if (meal.recipe?.title && !existing.sourceRecipes.includes(meal.recipe.title)) {
        existing.sourceRecipes.push(meal.recipe.title);
      }
      grouped.set(key, existing);
    });
  });

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { buildGroceryList };


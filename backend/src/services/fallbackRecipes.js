const fallbackRecipes = [
  {
    id: 716429,
    title: "Pasta with Garlic, Scallions, Cauliflower and Breadcrumbs",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
    readyInMinutes: 35,
    servings: 4,
    sourceUrl: "https://spoonacular.com/recipes/pasta-with-garlic-scallions-cauliflower-breadcrumbs-716429",
    summary: "A simple vegetable pasta suitable for a quick weekly meal.",
    nutrition: { nutrients: [{ name: "Calories", amount: 430 }, { name: "Protein", amount: 15, unit: "g" }, { name: "Carbohydrates", amount: 62, unit: "g" }, { name: "Fat", amount: 14, unit: "g" }] },
    extendedIngredients: [
      { nameClean: "pasta", amount: 400, unit: "g" },
      { nameClean: "cauliflower", amount: 1, unit: "head" },
      { nameClean: "garlic", amount: 3, unit: "cloves" },
      { nameClean: "scallions", amount: 4, unit: "" }
    ]
  },
  {
    id: 715538,
    title: "Chicken Fajita Stuffed Bell Pepper",
    image: "https://images.unsplash.com/photo-1598515214146-dab39da1243d?auto=format&fit=crop&w=900&q=80",
    readyInMinutes: 45,
    servings: 4,
    sourceUrl: "https://spoonacular.com/recipes/chicken-fajita-stuffed-bell-pepper-715538",
    summary: "Lean chicken, rice and peppers for a balanced prep-friendly dinner.",
    nutrition: { nutrients: [{ name: "Calories", amount: 390 }, { name: "Protein", amount: 32, unit: "g" }, { name: "Carbohydrates", amount: 42, unit: "g" }, { name: "Fat", amount: 11, unit: "g" }] },
    extendedIngredients: [
      { nameClean: "chicken breast", amount: 500, unit: "g" },
      { nameClean: "bell pepper", amount: 4, unit: "" },
      { nameClean: "rice", amount: 2, unit: "cups" },
      { nameClean: "onion", amount: 1, unit: "" }
    ]
  },
  {
    id: 782601,
    title: "Quinoa Chickpea Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    readyInMinutes: 25,
    servings: 3,
    sourceUrl: "https://spoonacular.com/recipes/quinoa-chickpea-salad-782601",
    summary: "A high-fiber lunch with reusable vegetables and simple dressing.",
    nutrition: { nutrients: [{ name: "Calories", amount: 360 }, { name: "Protein", amount: 14, unit: "g" }, { name: "Carbohydrates", amount: 48, unit: "g" }, { name: "Fat", amount: 13, unit: "g" }] },
    extendedIngredients: [
      { nameClean: "quinoa", amount: 1.5, unit: "cups" },
      { nameClean: "chickpeas", amount: 1, unit: "can" },
      { nameClean: "cucumber", amount: 1, unit: "" },
      { nameClean: "tomato", amount: 2, unit: "" }
    ]
  },
  {
    id: 639535,
    title: "Citrus Salmon with Brown Rice",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
    readyInMinutes: 30,
    servings: 2,
    sourceUrl: "https://spoonacular.com/recipes/citrus-salmon-with-brown-rice-639535",
    summary: "Protein-rich salmon paired with rice and vegetables.",
    nutrition: { nutrients: [{ name: "Calories", amount: 510 }, { name: "Protein", amount: 39, unit: "g" }, { name: "Carbohydrates", amount: 45, unit: "g" }, { name: "Fat", amount: 20, unit: "g" }] },
    extendedIngredients: [
      { nameClean: "salmon fillet", amount: 2, unit: "" },
      { nameClean: "brown rice", amount: 1, unit: "cup" },
      { nameClean: "lemon", amount: 1, unit: "" },
      { nameClean: "broccoli", amount: 2, unit: "cups" }
    ]
  },
  {
    id: 660306,
    title: "Lentil Vegetable Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    readyInMinutes: 55,
    servings: 5,
    sourceUrl: "https://spoonacular.com/recipes/lentil-vegetable-soup-660306",
    summary: "Batch-friendly soup that reuses vegetables across the week.",
    nutrition: { nutrients: [{ name: "Calories", amount: 310 }, { name: "Protein", amount: 18, unit: "g" }, { name: "Carbohydrates", amount: 46, unit: "g" }, { name: "Fat", amount: 7, unit: "g" }] },
    extendedIngredients: [
      { nameClean: "lentils", amount: 2, unit: "cups" },
      { nameClean: "carrot", amount: 3, unit: "" },
      { nameClean: "celery", amount: 3, unit: "stalks" },
      { nameClean: "onion", amount: 1, unit: "" }
    ]
  }
];

module.exports = fallbackRecipes;


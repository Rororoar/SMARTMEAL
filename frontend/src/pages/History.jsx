import { useEffect, useState } from "react";
import { mealPlanApi, recipeApi } from "../api/client";
import RecipeTile from "../components/RecipeTile";

export default function History() {
  const [mealPlans, setMealPlans] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([mealPlanApi.history(), recipeApi.saved()])
      .then(([historyData, savedData]) => {
        setMealPlans(historyData.mealPlans);
        setSavedRecipes(savedData.savedRecipes);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function removeSaved(recipe) {
    const data = await recipeApi.removeSaved(recipe.spoonacularId);
    setSavedRecipes(data.savedRecipes);
  }

  return (
    <main className="page-surface">
      <section className="page-heading">
        <div>
          <p className="eyebrow">History</p>
          <h2>Saved recipes and previous weekly plans.</h2>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="section-title">
        <h3>Saved recipes</h3>
        <p>Recipes kept for later planning.</p>
      </section>
      <section className="recipe-grid compact">
        {savedRecipes.map((recipe) => (
          <RecipeTile
            key={recipe.spoonacularId}
            recipe={recipe}
            onSave={removeSaved}
            buttonLabel="Remove"
          />
        ))}
      </section>

      <section className="history-list">
        <div className="section-title">
          <h3>Meal plan history</h3>
          <p>Recent generated weeks.</p>
        </div>
        {mealPlans.map((plan) => (
          <article key={plan._id} className="history-row">
            <strong>{new Date(plan.weekStart).toLocaleDateString()} week</strong>
            <span>{plan.meals.length} meals</span>
            <span>{plan.groceryItems.length} grocery items</span>
          </article>
        ))}
      </section>
    </main>
  );
}

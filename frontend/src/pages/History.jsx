import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mealPlanApi, recipeApi } from "../api/client";
import AddToPlanDialog from "../components/AddToPlanDialog";
import RecipeTile from "../components/RecipeTile";

export default function History() {
  const [mealPlans, setMealPlans] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [status, setStatus] = useState("");
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

  function mealRows() {
    return mealPlans.flatMap((plan) =>
      plan.meals.map((meal) => ({
        ...meal,
        planId: plan._id,
        weekStart: plan.weekStart
      }))
    );
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
      {status && <p className="form-status">{status}</p>}

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
            secondaryAction={setSelectedRecipe}
            secondaryLabel="Add to plan"
          />
        ))}
      </section>

      <section className="history-list">
        <div className="section-title">
          <h3>Meals by date</h3>
          <p>Meals already added or generated in recent plans.</p>
        </div>
        {mealRows().map((meal) => (
          <article key={meal._id || `${meal.planId}-${meal.date}-${meal.recipe?.spoonacularId}`} className="history-row meal-history-row">
            <strong>{new Date(meal.date).toLocaleDateString()}</strong>
            <span>{meal.mealType}</span>
            <Link to={`/recipes/${meal.recipe?.spoonacularId}`}>{meal.recipe?.title}</Link>
            <button type="button" className="secondary-button" onClick={() => setSelectedRecipe(meal.recipe)}>
              Add To Plan
            </button>
          </article>
        ))}
        {mealRows().length === 0 && <p className="empty-state">No Meal History Yet.</p>}
      </section>
      <AddToPlanDialog
        recipe={selectedRecipe}
        open={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
        onAdded={setStatus}
        onError={setError}
      />
    </main>
  );
}

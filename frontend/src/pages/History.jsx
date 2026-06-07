import { useEffect, useMemo, useState } from "react";
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

  async function toggleFavourite(recipe, isFavourite) {
    setError("");
    setStatus("");
    try {
      const data = isFavourite
        ? await recipeApi.removeSaved(recipe.spoonacularId)
        : await recipeApi.save(recipe);
      setSavedRecipes(data.savedRecipes);
      setStatus(isFavourite ? "Removed from favourite recipes." : "Added to favourite recipes.");
    } catch (err) {
      setError(err.message);
    }
  }

  const mealRows = useMemo(
    () =>
      mealPlans.flatMap((plan) =>
        plan.meals.map((meal) => ({
          ...meal,
          planId: plan._id,
          weekStart: plan.weekStart
        }))
      ),
    [mealPlans]
  );

  return (
    <main className="page-surface">
      <section className="panel-shell">
        <div className="page-heading">
          <div>
            <h2>History</h2>
            <p className="page-subtitle">Favourite recipes and previously planned meals.</p>
          </div>
        </div>

        {(error || status) && (
          <div className="inline-messages">
            {error && <p className="form-error inline-message">{error}</p>}
            {status && <p className="form-status inline-message">{status}</p>}
          </div>
        )}

        <section className="history-section">
          <div className="section-title">
            <h3>Favourite Recipes</h3>
          </div>
          <div className="recipe-grid">
            {savedRecipes.map((recipe) => (
              <RecipeTile
                key={recipe.spoonacularId}
                recipe={recipe}
                onToggleFavourite={toggleFavourite}
                isFavourite
                secondaryAction={setSelectedRecipe}
                secondaryLabel="Add To Plan"
              />
            ))}
          </div>
          {savedRecipes.length === 0 && <p className="empty-state">No favourite recipes yet.</p>}
        </section>

        <section className="history-section">
          <div className="section-title">
            <h3>Meals by Date</h3>
          </div>
          <div className="history-card-list">
            {mealRows.map((meal) => (
              <article key={meal._id || `${meal.planId}-${meal.date}-${meal.recipe?.spoonacularId}`} className="history-card">
                <div className="history-card-meta">
                  <strong>{new Date(meal.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</strong>
                  <span>{meal.mealType}</span>
                </div>
                <Link to={`/recipes/${meal.recipe?.spoonacularId}`}>{meal.recipe?.title}</Link>
                <button type="button" className="secondary-button" onClick={() => setSelectedRecipe(meal.recipe)}>
                  Add To Plan
                </button>
              </article>
            ))}
          </div>
          {mealRows.length === 0 && <p className="empty-state">No meal history yet.</p>}
        </section>
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

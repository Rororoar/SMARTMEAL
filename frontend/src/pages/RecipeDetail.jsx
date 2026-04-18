import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recipeApi } from "../api/client";
import AddToPlanDialog from "../components/AddToPlanDialog";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipeApi
      .get(id)
      .then((data) => setRecipe(data.recipe))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveRecipe() {
    setError("");
    setStatus("");
    try {
      await recipeApi.save(recipe);
      setStatus("Recipe saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <main className="page-surface">Loading recipe...</main>;
  }

  if (!recipe) {
    return (
      <main className="page-surface">
        <p className="form-error">{error || "Recipe not found."}</p>
        <Link to="/recipes">Back to recipes</Link>
      </main>
    );
  }

  const image =
    recipe.image ||
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80";

  return (
    <main className="page-surface">
      <section className="recipe-detail-hero">
        <img src={image} alt="" />
        <div>
          <Link to="/recipes" className="back-link">
            Back to recipes
          </Link>
          <p className="eyebrow">Recipe detail</p>
          <h2>{recipe.title}</h2>
          <p>{recipe.summary || "Ingredients, nutrition and cooking steps for this meal."}</p>
          <div className="detail-metrics">
            <span>{recipe.readyInMinutes || 30} min</span>
            <span>{recipe.servings || 1} servings</span>
            <span>{recipe.nutrition?.calories || "N/A"} kcal</span>
            <span>{recipe.nutrition?.protein || "N/A"} protein</span>
          </div>
          <div className="recipe-actions">
            <button type="button" onClick={() => setDialogOpen(true)}>
              Add to plan
            </button>
            <button type="button" className="secondary-button" onClick={saveRecipe}>
              Save recipe
            </button>
          </div>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <section className="recipe-detail-grid">
        <article className="detail-section">
          <h3>Ingredients</h3>
          <ul className="ingredient-list">
            {recipe.ingredients?.length ? (
              recipe.ingredients.map((ingredient, index) => (
                <li key={`${ingredient.name}-${index}`}>
                  <span>{ingredient.name}</span>
                  <strong>
                    {ingredient.amount || ""} {ingredient.unit || ""}
                  </strong>
                </li>
              ))
            ) : (
              <li>No ingredient details available.</li>
            )}
          </ul>
        </article>

        <article className="detail-section">
          <h3>Cooking steps</h3>
          <ol className="step-list">
            {recipe.steps?.length ? (
              recipe.steps.map((step) => <li key={step.number}>{step.step}</li>)
            ) : (
              <li>Open the source recipe for full cooking instructions.</li>
            )}
          </ol>
          {recipe.sourceUrl && (
            <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
              View original recipe
            </a>
          )}
        </article>
      </section>

      <AddToPlanDialog
        recipe={recipe}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdded={setStatus}
        onError={setError}
      />
    </main>
  );
}


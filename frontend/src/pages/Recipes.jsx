import { useEffect, useState } from "react";
import { mealPlanApi, recipeApi } from "../api/client";
import RecipeTile from "../components/RecipeTile";

export default function Recipes() {
  const [query, setQuery] = useState("chicken");
  const [diet, setDiet] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  useEffect(() => {
    recipeApi
      .search({ number: 6 })
      .then((data) => setRecommended(data.recipes))
      .catch((err) => setError(err.message))
      .finally(() => setRecommendationLoading(false));
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const data = await recipeApi.search({ query, diet, number: 12 });
      setRecipes(data.recipes);
      setStatus(`${data.recipes.length} recipes found.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveRecipe(recipe) {
    setError("");
    setStatus("");
    try {
      await recipeApi.save(recipe);
      setStatus("Recipe saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addToPlan(recipe) {
    setError("");
    setStatus("");
    try {
      const data = await mealPlanApi.addRecipeToCurrent(recipe);
      setStatus(data.message || "Recipe added to this week's plan.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-surface">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Recipe Search</p>
          <h2>Find meals that match the profile filters.</h2>
        </div>
      </section>

      <form className="search-bar" onSubmit={handleSearch}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipe" />
        <select value={diet} onChange={(event) => setDiet(event.target.value)}>
          <option value="">Any diet</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten free">Gluten free</option>
          <option value="ketogenic">Ketogenic</option>
          <option value="pescetarian">Pescetarian</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <section className="section-title">
        <h3>Recommended for your profile</h3>
        <p>Uses your saved preferences, allergies and cooking time.</p>
      </section>
      {recommendationLoading && <p className="empty-state">Loading recommendations...</p>}
      {!recommendationLoading && recommended.length === 0 && (
        <p className="empty-state">Save your profile to improve recommendations.</p>
      )}
      <section className="recipe-grid compact">
        {recommended.map((recipe) => (
          <RecipeTile
            key={recipe.spoonacularId}
            recipe={recipe}
            onSave={saveRecipe}
            buttonLabel="Save recipe"
            secondaryAction={addToPlan}
            secondaryLabel="Add to plan"
          />
        ))}
      </section>

      <section className="section-title">
        <h3>Search results</h3>
        <p>Search for a specific ingredient or diet.</p>
      </section>

      <section className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeTile
            key={recipe.spoonacularId}
            recipe={recipe}
            onSave={saveRecipe}
            buttonLabel="Save recipe"
            secondaryAction={addToPlan}
            secondaryLabel="Add to plan"
          />
        ))}
      </section>
    </main>
  );
}

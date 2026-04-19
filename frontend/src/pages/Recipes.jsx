import { useEffect, useState } from "react";
import { recipeApi } from "../api/client";
import AddToPlanDialog from "../components/AddToPlanDialog";
import RecipeTile from "../components/RecipeTile";

export default function Recipes() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
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
    setHasSearched(true);
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

  function openAddToPlan(recipe) {
    setError("");
    setStatus("");
    setSelectedRecipe(recipe);
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
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search here, for example chicken" />
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

      {!hasSearched && (
        <>
          <section className="section-title">
            <h3>Recommended For Your Profile</h3>
            <p>Uses Your Saved Preferences, Allergies And Cooking Time.</p>
          </section>
          {recommendationLoading && <p className="empty-state">Loading Recommendations...</p>}
          {!recommendationLoading && recommended.length === 0 && (
            <p className="empty-state">Save Your Profile To Improve Recommendations.</p>
          )}
          <section className="recipe-grid compact">
            {recommended.map((recipe) => (
              <RecipeTile
                key={recipe.spoonacularId}
                recipe={recipe}
                onSave={saveRecipe}
                buttonLabel="Save Recipe"
                secondaryAction={openAddToPlan}
                secondaryLabel="Add To Plan"
              />
            ))}
          </section>
        </>
      )}

      {hasSearched && (
        <section className="section-title">
          <h3>Search Results</h3>
          <p>Only Dishes Matching Your Search Are Shown Here.</p>
        </section>
      )}

      <section className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeTile
            key={recipe.spoonacularId}
            recipe={recipe}
            onSave={saveRecipe}
            buttonLabel="Save Recipe"
            secondaryAction={openAddToPlan}
            secondaryLabel="Add To Plan"
          />
        ))}
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

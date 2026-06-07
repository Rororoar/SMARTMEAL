import { useEffect, useMemo, useState } from "react";
import { recipeApi } from "../api/client";
import AddToPlanDialog from "../components/AddToPlanDialog";
import RecipeTile from "../components/RecipeTile";

export default function Recipes() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  useEffect(() => {
    Promise.all([recipeApi.search({ number: 8 }), recipeApi.saved()])
      .then(([recipeData, savedData]) => {
        setRecommended(recipeData.recipes);
        setSavedRecipes(savedData.savedRecipes);
      })
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

  const visibleRecipes = hasSearched ? recipes : recommended;
  const favouriteIds = useMemo(() => new Set(savedRecipes.map((recipe) => recipe.spoonacularId)), [savedRecipes]);

  return (
    <main className="page-surface">
      <section className="panel-shell">
        <div className="page-heading">
          <div>
            <h2>{hasSearched ? `${visibleRecipes.length} Recipes Found` : "Recipes"}</h2>
            <p className="page-subtitle">
              {hasSearched ? "Only dishes matching your search are shown here." : "Recommended meals based on your saved profile."}
            </p>
          </div>
        </div>

        <form className="recipe-search-shell" onSubmit={handleSearch}>
          <div className="recipe-search-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes..."
              aria-label="Search recipes"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
            <button type="button" className="secondary-button filter-button" onClick={() => setFiltersOpen((open) => !open)}>
              Filters
            </button>
          </div>
          {filtersOpen && (
            <div className="filters-panel">
              <label>
                Diet
                <select value={diet} onChange={(event) => setDiet(event.target.value)}>
                  <option value="">Any diet</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten free">Gluten-Free</option>
                  <option value="ketogenic">Keto</option>
                  <option value="pescetarian">Pescetarian</option>
                </select>
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Apply Search"}
              </button>
            </div>
          )}
        </form>

        {(error || status) && (
          <div className="inline-messages">
            {error && <p className="form-error inline-message">{error}</p>}
            {status && <p className="form-status inline-message">{status}</p>}
          </div>
        )}

        {!hasSearched && recommendationLoading && <p className="empty-state">Loading recommendations...</p>}

        <section className="recipe-grid">
          {visibleRecipes.map((recipe) => (
            <RecipeTile
              key={recipe.spoonacularId}
              recipe={recipe}
              onToggleFavourite={toggleFavourite}
              isFavourite={favouriteIds.has(recipe.spoonacularId)}
              secondaryAction={setSelectedRecipe}
              secondaryLabel="Add To Plan"
            />
          ))}
        </section>

        {!recommendationLoading && visibleRecipes.length === 0 && (
          <p className="empty-state">{hasSearched ? "No recipes match that search." : "Save your profile to improve recommendations."}</p>
        )}
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

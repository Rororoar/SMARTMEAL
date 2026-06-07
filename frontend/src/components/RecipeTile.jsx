import { Link } from "react-router-dom";

const FILLED_HEART = "\u2764\uFE0F";
const EMPTY_HEART = "\u2661";

function recipeTags(recipe) {
  const tags = [];
  const protein = Number.parseInt(recipe.nutrition?.protein, 10);
  const carbs = Number.parseInt(recipe.nutrition?.carbs, 10);
  const ready = Number(recipe.readyInMinutes || 0);

  if (protein >= 20) tags.push("High-Protein");
  if (carbs && carbs <= 25) tags.push("Low-Carb");
  if (ready && ready <= 20) tags.push("Quick");
  if ((recipe.summary || "").toLowerCase().includes("vegetarian") || (recipe.title || "").toLowerCase().includes("salad")) {
    tags.push("Vegetarian");
  }
  if ((recipe.summary || "").toLowerCase().includes("gluten")) {
    tags.push("Gluten-Free");
  }

  return [...new Set(tags)].slice(0, 3);
}

function macroValue(value) {
  return value || "N/A";
}

export default function RecipeTile({
  recipe,
  onToggleFavourite,
  isFavourite = false,
  secondaryAction,
  secondaryLabel = "Add To Plan"
}) {
  const image =
    recipe.image ||
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80";
  const tags = recipeTags(recipe);

  return (
    <article className="recipe-card">
      <Link className="recipe-card-image" to={`/recipes/${recipe.spoonacularId}`}>
        <img src={image} alt="" />
      </Link>
      {onToggleFavourite && (
        <button
          type="button"
          className={`recipe-favourite ${isFavourite ? "is-active" : ""}`}
          aria-label={isFavourite ? "Remove from favourite recipes" : "Add to favourite recipes"}
          onClick={() => onToggleFavourite(recipe, isFavourite)}
        >
          {isFavourite ? FILLED_HEART : EMPTY_HEART}
        </button>
      )}
      <div className="recipe-card-body">
        <h3>
          <Link to={`/recipes/${recipe.spoonacularId}`}>{recipe.title}</Link>
        </h3>
        <p className="recipe-time">{recipe.readyInMinutes || 30} min</p>
        <div className="recipe-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="recipe-macros">
          <div>
            <span>Calories</span>
            <strong>{macroValue(recipe.nutrition?.calories)}</strong>
          </div>
          <div>
            <span>Protein</span>
            <strong>{macroValue(recipe.nutrition?.protein)}</strong>
          </div>
          <div>
            <span>Carbs</span>
            <strong>{macroValue(recipe.nutrition?.carbs)}</strong>
          </div>
          <div>
            <span>Fat</span>
            <strong>{macroValue(recipe.nutrition?.fat)}</strong>
          </div>
        </div>
        {secondaryAction && (
          <button type="button" className="recipe-primary-button" onClick={() => secondaryAction(recipe)}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </article>
  );
}

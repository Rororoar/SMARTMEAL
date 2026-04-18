export default function RecipeTile({
  recipe,
  onSave,
  buttonLabel = "Save recipe",
  secondaryAction,
  secondaryLabel = "Add to plan"
}) {
  const image =
    recipe.image ||
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="recipe-tile">
      <img src={image} alt="" />
      <div className="recipe-copy">
        <span>{recipe.readyInMinutes || 30} min</span>
        <h3>{recipe.title}</h3>
        <p>
          {recipe.nutrition?.calories || "N/A"} kcal · {recipe.nutrition?.protein || "N/A"} protein
        </p>
        {onSave && (
          <div className="recipe-actions">
            <button type="button" onClick={() => onSave(recipe)}>
              {buttonLabel}
            </button>
            {secondaryAction && (
              <button type="button" className="secondary-button" onClick={() => secondaryAction(recipe)}>
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

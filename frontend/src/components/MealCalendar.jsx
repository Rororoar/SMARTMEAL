const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
});

function groupMeals(meals) {
  return meals.reduce((acc, meal) => {
    const key = new Date(meal.date).toDateString();
    acc[key] = acc[key] || [];
    acc[key].push(meal);
    return acc;
  }, {});
}

export default function MealCalendar({ mealPlan }) {
  if (!mealPlan?.meals?.length) {
    return (
      <section className="empty-state">
        <h2>No weekly plan yet</h2>
        <p>Generate a plan after saving your preferences.</p>
      </section>
    );
  }

  const grouped = groupMeals(mealPlan.meals);

  return (
    <section className="calendar-grid" aria-label="Weekly meal calendar">
      {Object.entries(grouped).map(([date, meals]) => (
        <article className="day-column" key={date}>
          <div className="day-heading">
            <span>{dayFormatter.format(new Date(date))}</span>
          </div>
          {meals.map((meal) => (
            <div className="meal-row" key={meal._id || `${date}-${meal.mealType}`}>
              <img
                src={
                  meal.recipe.image ||
                  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80"
                }
                alt=""
              />
              <div>
                <span className="meal-type">{meal.mealType}</span>
                <strong>{meal.recipe.title}</strong>
                <small>
                  {meal.recipe.readyInMinutes || 30} min · {meal.recipe.nutrition?.calories || "N/A"} kcal
                </small>
              </div>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}

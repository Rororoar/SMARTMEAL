import { Link } from "react-router-dom";

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

function buildWeekDays(mealPlan) {
  const start = mealPlan?.weekStart ? new Date(mealPlan.weekStart) : new Date();
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function MealCalendar({ mealPlan, onRemoveMeal, onClearDay }) {
  if (!mealPlan?.meals?.length) {
    return (
      <section className="empty-state">
        <h2>No weekly plan yet</h2>
        <p>Generate a plan after saving your preferences.</p>
      </section>
    );
  }

  const grouped = groupMeals(mealPlan.meals);
  const days = buildWeekDays(mealPlan);

  return (
    <section className="calendar-grid" aria-label="Weekly meal calendar">
      {days.map((day) => {
        const date = day.toDateString();
        const meals = grouped[date] || [];

        return (
        <article className="day-column" key={date}>
          <div className="day-heading">
            <span className="date-label">{dayFormatter.format(day)}</span>
            {meals.length > 0 && (
              <button type="button" className="text-button danger-link" onClick={() => onClearDay?.(day.toISOString())}>
                Clear Day
              </button>
            )}
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
                <strong>
                  <Link to={`/recipes/${meal.recipe.spoonacularId}`}>{meal.recipe.title}</Link>
                </strong>
                <small>
                  {meal.recipe.readyInMinutes || 30} min - {meal.recipe.nutrition?.calories || "N/A"} kcal
                </small>
                <button type="button" className="text-button danger-link" onClick={() => onRemoveMeal?.(meal)}>
                  Remove Dish
                </button>
              </div>
            </div>
          ))}
          {meals.length === 0 && <p className="empty-day">No Dish Planned</p>}
        </article>
        );
      })}
    </section>
  );
}

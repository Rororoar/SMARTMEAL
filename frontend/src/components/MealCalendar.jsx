import { Link } from "react-router-dom";
import { formatDateKey } from "../utils/week";

const headerFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long"
});

const fallbackSlots = ["breakfast", "lunch", "dinner"];

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildWeekDays(mealPlan) {
  const start = mealPlan?.weekStart ? startOfDay(mealPlan.weekStart) : startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function groupMeals(meals) {
  return meals.reduce((acc, meal) => {
    const dayKey = formatDateKey(startOfDay(meal.date));
    const typeKey = String(meal.mealType || "dinner").toLowerCase();

    acc[dayKey] = acc[dayKey] || {};
    acc[dayKey][typeKey] = acc[dayKey][typeKey] || [];
    acc[dayKey][typeKey].push(meal);
    return acc;
  }, {});
}

function mealTypesForPlan(mealPlan) {
  const seen = new Set(
    (mealPlan?.meals || []).map((meal) => String(meal.mealType || "").toLowerCase()).filter(Boolean)
  );

  fallbackSlots.forEach((slot) => seen.add(slot));

  if (seen.has("snack")) {
    return [...fallbackSlots, "snack"];
  }

  return fallbackSlots;
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderMealCard(meal, onRemoveMeal) {
  const image =
    meal.recipe.image ||
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80";

  return (
    <article className="calendar-recipe-card" key={meal._id || `${meal.date}-${meal.recipe?.spoonacularId}`}>
      <img src={image} alt="" />
      <div className="calendar-recipe-copy">
        <Link to={`/recipes/${meal.recipe.spoonacularId}`}>{meal.recipe.title}</Link>
        <span>{meal.recipe.nutrition?.calories || "N/A"} cal</span>
      </div>
      <button type="button" className="slot-text-button" onClick={() => onRemoveMeal?.(meal)}>
        Remove
      </button>
    </article>
  );
}

export default function MealCalendar({ mealPlan, onRemoveMeal, onClearDay }) {
  const days = buildWeekDays(mealPlan);
  const groupedMeals = groupMeals(mealPlan?.meals || []);
  const slotTypes = mealTypesForPlan(mealPlan);

  return (
    <section className="calendar-board" aria-label="Weekly meal calendar">
      <div className="calendar-board-headings">
        {days.map((day) => (
          <div className="calendar-day-label" key={formatDateKey(day)}>
            {headerFormatter.format(day)}
          </div>
        ))}
      </div>

      <div className="calendar-board-grid">
        {days.map((day) => {
          const dayKey = formatDateKey(day);
          const dayMeals = groupedMeals[dayKey] || {};
          const dayHasMeals = Object.values(dayMeals).some((items) => items.length);

          return (
            <section className="calendar-day-column" key={dayKey}>
              <div className="calendar-day-header">
                <div>
                  <span className="calendar-mobile-day">{headerFormatter.format(day)}</span>
                  <p>{day.toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                </div>
                {dayHasMeals && (
                  <button type="button" className="slot-text-button" onClick={() => onClearDay?.(dayKey)}>
                    Clear Day
                  </button>
                )}
              </div>

              <div className="calendar-slot-list">
                {slotTypes.map((slot) => {
                  const meals = dayMeals[slot] || [];

                  return (
                    <article className="calendar-slot" key={`${dayKey}-${slot}`}>
                      <p className="calendar-slot-label">{titleCase(slot)}</p>
                      {meals.length > 0 ? (
                        <div className="calendar-slot-stack">
                          {meals.map((meal) => renderMealCard(meal, onRemoveMeal))}
                        </div>
                      ) : (
                        <Link to="/recipes" className="calendar-empty-slot">
                          <span>+</span>
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

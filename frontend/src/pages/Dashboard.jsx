import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mealPlanApi } from "../api/client";
import MealCalendar from "../components/MealCalendar";

function formatWeekLabel(weekStart) {
  if (!weekStart) return "This week";
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en", {
    month: "short",
    day: "numeric"
  })}`;
}

export default function Dashboard() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    mealPlanApi
      .current()
      .then((data) => setMealPlan(data.mealPlan))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const meals = mealPlan?.meals || [];
    const groceries = mealPlan?.groceryItems?.length || 0;
    const prepLeft = mealPlan?.prepTasks?.filter((task) => !task.done).length || 0;
    return {
      meals: meals.length,
      groceries,
      prepLeft
    };
  }, [mealPlan]);

  async function generatePlan() {
    setError("");
    setStatus("");
    setGenerating(true);
    try {
      const data = await mealPlanApi.generate();
      setMealPlan(data.mealPlan);
      setStatus("Weekly meal plan generated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function removeMeal(meal) {
    if (!mealPlan?._id || !meal?._id) return;

    setError("");
    setStatus("");
    try {
      const data = await mealPlanApi.removeMeal(mealPlan._id, meal._id);
      setMealPlan(data.mealPlan);
      setStatus(data.message || "Dish removed from the plan.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearDay(date) {
    if (!mealPlan?._id) return;

    setError("");
    setStatus("");
    try {
      const data = await mealPlanApi.clearDay(mealPlan._id, date);
      setMealPlan(data.mealPlan);
      setStatus(data.message || "Day cleared from the plan.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearWeek() {
    if (!mealPlan?._id) return;

    setError("");
    setStatus("");
    try {
      const data = await mealPlanApi.clearWeek(mealPlan._id);
      setMealPlan(data.mealPlan);
      setStatus(data.message || "Weekly plan cleared.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <main className="page-surface">Loading weekly plan...</main>;
  }

  return (
    <main className="page-surface">
      <section className="panel-shell">
        <div className="page-heading calendar-heading">
          <div>
            <h2>Weekly Meal Plan</h2>
            <p className="page-subtitle">
              Generate a full week automatically from your Profile preferences, allergies and goals.
            </p>
          </div>
          <div className="calendar-toolbar">
            <div className="calendar-week-pill">{formatWeekLabel(mealPlan?.weekStart)}</div>
            <button type="button" onClick={generatePlan} disabled={generating}>
              {generating ? "Generating..." : "Generate Meal Plan"}
            </button>
            {mealPlan?.meals?.length > 0 && (
              <button type="button" className="secondary-button" onClick={clearWeek}>
                Clear Week
              </button>
            )}
          </div>
        </div>

        {(error || status) && (
          <div className="inline-messages">
            {error && <p className="form-error inline-message">{error}</p>}
            {status && <p className="form-status inline-message">{status}</p>}
          </div>
        )}

        <div className="calendar-summary">
          <article>
            <span>{summary.meals}</span>
            <p>Dishes planned</p>
          </article>
          <article>
            <span>{summary.groceries}</span>
            <p>Grocery items</p>
          </article>
          <article>
            <span>{summary.prepLeft}</span>
            <p>Prep tasks left</p>
          </article>
          <article>
            <Link to="/history">View history</Link>
            <p>Open favourite recipes and past weeks.</p>
          </article>
        </div>

        {!mealPlan?.meals?.length ? (
          <section className="calendar-empty-state">
            <h3>No meals planned yet</h3>
            <p>Click Generate Meal Plan to fill the week automatically. Adding recipes manually is optional.</p>
            <div className="recipe-actions">
              <button type="button" onClick={generatePlan} disabled={generating}>
                {generating ? "Generating..." : "Generate Meal Plan"}
              </button>
              <Link to="/recipes" className="secondary-link-button">
                Browse Recipes
              </Link>
            </div>
          </section>
        ) : (
          <MealCalendar mealPlan={mealPlan} onRemoveMeal={removeMeal} onClearDay={clearDay} />
        )}
      </section>
    </main>
  );
}

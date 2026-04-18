import { useEffect, useMemo, useState } from "react";
import { mealPlanApi } from "../api/client";
import MealCalendar from "../components/MealCalendar";

export default function Dashboard() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mealPlanApi
      .current()
      .then((data) => setMealPlan(data.mealPlan))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const meals = mealPlan?.meals || [];
    const calories = meals.reduce((sum, meal) => sum + Number(meal.recipe?.nutrition?.calories || 0), 0);
    const groceries = mealPlan?.groceryItems?.length || 0;
    const tasks = mealPlan?.prepTasks?.filter((task) => !task.done).length || 0;
    return { calories, groceries, tasks };
  }, [mealPlan]);

  async function generatePlan() {
    setError("");
    setGenerating(true);
    try {
      const data = await mealPlanApi.generate();
      setMealPlan(data.mealPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function togglePrep(task) {
    const data = await mealPlanApi.togglePrep(mealPlan._id, task._id, !task.done);
    setMealPlan(data.mealPlan);
  }

  if (loading) {
    return <main className="page-surface">Loading weekly plan...</main>;
  }

  return (
    <main className="page-surface">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Weekly Plan</p>
          <h2>Meals, groceries and prep tasks in one flow.</h2>
        </div>
        <button type="button" onClick={generatePlan} disabled={generating}>
          {generating ? "Generating..." : "Generate meal plan"}
        </button>
      </section>

      {error && <p className="form-error">{error}</p>}

      <section className="metrics-band" aria-label="Plan summary">
        <div>
          <span>{mealPlan?.meals?.length || 0}</span>
          <p>planned meals</p>
        </div>
        <div>
          <span>{totals.groceries}</span>
          <p>grocery items</p>
        </div>
        <div>
          <span>{totals.tasks}</span>
          <p>prep tasks left</p>
        </div>
        <div>
          <span>{totals.calories || 0}</span>
          <p>weekly kcal</p>
        </div>
      </section>

      <MealCalendar mealPlan={mealPlan} />

      {mealPlan?.prepTasks?.length > 0 && (
        <section className="task-list">
          <div className="section-title">
            <h3>Prep tasks</h3>
            <p>Small actions that keep the week moving.</p>
          </div>
          {mealPlan.prepTasks.slice(0, 8).map((task) => (
            <label className="check-row" key={task._id}>
              <input type="checkbox" checked={task.done} onChange={() => togglePrep(task)} />
              <span>{task.label}</span>
            </label>
          ))}
        </section>
      )}
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mealPlanApi } from "../api/client";
import { formatDateKey } from "../utils/week";

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function estimateMinutes(task) {
  const label = String(task.label || "").toLowerCase();
  if (label.includes("marinate")) return 10;
  if (label.includes("chop") || label.includes("wash")) return 15;
  if (label.includes("roast") || label.includes("bake")) return 20;
  return task.mealType === "breakfast" ? 10 : 15;
}

function groupTasks(tasks) {
  return tasks.reduce((acc, task) => {
    const key = formatDateKey(startOfDay(task.date));
    acc[key] = acc[key] || [];
    acc[key].push(task);
    return acc;
  }, {});
}

function groupMeals(meals) {
  return meals.reduce((acc, meal) => {
    const key = formatDateKey(startOfDay(meal.date));
    acc[key] = acc[key] || [];
    acc[key].push(meal);
    return acc;
  }, {});
}

function labelForDay(value) {
  return new Date(value).toLocaleDateString("en", { weekday: "long" });
}

function mealTag(task) {
  const type = String(task.mealType || "prep").toLowerCase();
  if (type === "dinner") return "Cook";
  if (type === "lunch") return "Prep";
  if (type === "breakfast") return "Ready";
  return "Task";
}

export default function MealPrep() {
  const [mealPlan, setMealPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    mealPlanApi
      .current()
      .then((data) => {
        setMealPlan(data.mealPlan);
        const firstTaskDate = data.mealPlan?.prepTasks?.[0]?.date;
        if (firstTaskDate) {
          setSelectedDay(formatDateKey(startOfDay(firstTaskDate)));
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const groupedTasks = useMemo(() => groupTasks(mealPlan?.prepTasks || []), [mealPlan]);
  const groupedMeals = useMemo(() => groupMeals(mealPlan?.meals || []), [mealPlan]);
  const dayKeys = useMemo(() => Object.keys(groupedTasks).sort(), [groupedTasks]);
  const activeDay = selectedDay || dayKeys[0] || "";
  const activeTasks = activeDay ? groupedTasks[activeDay] || [] : [];
  const activeMeals = activeDay ? groupedMeals[activeDay] || [] : [];

  const totals = useMemo(() => {
    const tasks = mealPlan?.prepTasks || [];
    const totalMinutes = tasks.reduce((sum, task) => sum + estimateMinutes(task), 0);
    const completedTasks = tasks.filter((task) => task.done).length;
    const remainingMinutes = tasks.filter((task) => !task.done).reduce((sum, task) => sum + estimateMinutes(task), 0);

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalMinutes,
      remainingMinutes
    };
  }, [mealPlan]);

  async function togglePrep(task) {
    if (!mealPlan?._id) return;

    setError("");
    setStatus("");
    try {
      const data = await mealPlanApi.togglePrep(mealPlan._id, task._id, !task.done);
      setMealPlan(data.mealPlan);
      setStatus(task.done ? "Task marked as pending." : "Task completed.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-surface">
      <section className="panel-shell">
        <div className="page-heading">
          <div>
            <h2>Meal Prep Schedule</h2>
            <p className="page-subtitle">Plan and track your meal preparation tasks.</p>
          </div>
          <Link to="/history" className="ghost-link">
            View History
          </Link>
        </div>

        {(error || status) && (
          <div className="inline-messages">
            {error && <p className="form-error inline-message">{error}</p>}
            {status && <p className="form-status inline-message">{status}</p>}
          </div>
        )}

        {!mealPlan?.prepTasks?.length ? (
          <section className="calendar-empty-state">
            <h3>No prep tasks yet</h3>
            <p>Generate a weekly plan or add recipes to your calendar to create prep work.</p>
            <Link to="/" className="secondary-link-button">
              Go to Calendar
            </Link>
          </section>
        ) : (
          <>
            <div className="prep-day-tabs">
              {dayKeys.map((dayKey) => {
                const tasks = groupedTasks[dayKey] || [];
                const doneCount = tasks.filter((task) => task.done).length;
                return (
                  <button
                    type="button"
                    key={dayKey}
                    className={`prep-day-tab ${activeDay === dayKey ? "is-active" : ""}`}
                    onClick={() => setSelectedDay(dayKey)}
                  >
                    <span>{labelForDay(dayKey)}</span>
                    <strong>
                      {doneCount}/{tasks.length}
                    </strong>
                  </button>
                );
              })}
            </div>

            <div className="prep-summary">
              <article>
                <p>Total Tasks</p>
                <span>
                  {totals.completedTasks} / {totals.totalTasks}
                </span>
              </article>
              <article>
                <p>Total Time</p>
                <span>{totals.totalMinutes} min</span>
              </article>
              <article>
                <p>Time Remaining</p>
                <span>{totals.remainingMinutes} min</span>
              </article>
            </div>

            <section className="prep-timeline">
              {activeTasks.map((task) => (
                <article key={task._id} className={`prep-task-card ${task.done ? "is-done" : ""}`}>
                  <span className={`prep-task-tag prep-tag-${mealTag(task).toLowerCase()}`}>{mealTag(task)}</span>
                  <div className="prep-task-copy">
                    <h3>{task.label}</h3>
                    <p>
                      {task.mealType} <span>&middot;</span> {estimateMinutes(task)} min
                    </p>
                  </div>
                  <button
                    type="button"
                    className={task.done ? "secondary-button" : "ghost-complete-button"}
                    onClick={() => togglePrep(task)}
                  >
                    {task.done ? "Undo" : "Complete"}
                  </button>
                </article>
              ))}
            </section>

            <section className="history-section">
              <div className="section-title">
                <h3>Recipe Steps</h3>
              </div>
              <div className="history-card-list">
                {activeMeals.map((meal) => (
                  <article key={meal._id || `${meal.date}-${meal.mealType}`} className="history-card">
                    <div className="history-card-meta">
                      <strong>{meal.recipe?.title}</strong>
                      <span>{meal.mealType}</span>
                    </div>
                    <ol className="step-list">
                      {(meal.recipe?.steps || []).map((step) => (
                        <li key={`${meal._id || meal.recipe?.spoonacularId}-${step.number}`}>{step.step}</li>
                      ))}
                    </ol>
                    {!meal.recipe?.steps?.length && <p className="empty-state">No recipe steps available for this meal yet.</p>}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

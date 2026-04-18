import { useMemo, useState } from "react";
import { mealPlanApi } from "../api/client";
import { startOfWeek, weekDateOptions } from "../utils/week";

export default function AddToPlanDialog({ recipe, open, onClose, onAdded, onError }) {
  const dates = useMemo(() => weekDateOptions(), []);
  const [date, setDate] = useState(dates[0]?.value || new Date().toISOString());
  const [mealType, setMealType] = useState("dinner");
  const [loading, setLoading] = useState(false);

  if (!open || !recipe) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const selectedDate = new Date(date);
      const weekStart = startOfWeek(selectedDate).toISOString();
      const data = await mealPlanApi.addRecipeToCurrent(recipe, {
        date,
        weekStart,
        mealType
      });
      onAdded?.(data.message || "Recipe added to this week's plan.");
      onClose();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="plan-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <p className="eyebrow">Add to plan</p>
        <h3>{recipe.title}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Choose day
            <select value={date} onChange={(event) => setDate(event.target.value)}>
              {dates.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Meal type
            <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add to plan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

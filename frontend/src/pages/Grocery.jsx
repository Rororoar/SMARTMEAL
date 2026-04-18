import { useEffect, useState } from "react";
import { mealPlanApi } from "../api/client";

export default function Grocery() {
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mealPlanApi
      .current()
      .then((data) => setMealPlan(data.mealPlan))
      .catch((err) => setError(err.message));
  }, []);

  async function toggleItem(item) {
    const data = await mealPlanApi.toggleGrocery(mealPlan._id, item._id, !item.purchased);
    setMealPlan(data.mealPlan);
  }

  return (
    <main className="page-surface">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Grocery List</p>
          <h2>Ingredients are combined across the weekly plan.</h2>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      {!mealPlan && <p className="empty-state">Generate a weekly plan first.</p>}

      {mealPlan?.groceryItems?.length > 0 && (
        <section className="grocery-list">
          {mealPlan.groceryItems.map((item) => (
            <label className="check-row grocery-row" key={item._id}>
              <input type="checkbox" checked={item.purchased} onChange={() => toggleItem(item)} />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {Number(item.amount || 0).toFixed(item.amount % 1 ? 1 : 0)} {item.unit}
                </small>
              </span>
              <em>{item.sourceRecipes?.slice(0, 2).join(", ")}</em>
            </label>
          ))}
        </section>
      )}
    </main>
  );
}


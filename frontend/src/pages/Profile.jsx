import { useEffect, useState } from "react";
import { profileApi } from "../api/client";

function listToText(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Profile() {
  const [form, setForm] = useState({
    dietaryPreferences: "",
    allergies: "",
    dislikedIngredients: "",
    preferredIngredients: "",
    targetCalories: 2000,
    targetProtein: 90,
    maxReadyTime: 60,
    mealsPerDay: "lunch, dinner"
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(""), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    profileApi
      .get()
      .then(({ profile }) => {
        setForm({
          dietaryPreferences: listToText(profile.dietaryPreferences),
          allergies: listToText(profile.allergies),
          dislikedIngredients: listToText(profile.dislikedIngredients),
          preferredIngredients: listToText(profile.preferredIngredients),
          targetCalories: profile.targetCalories || 2000,
          targetProtein: profile.targetProtein || 90,
          maxReadyTime: profile.maxReadyTime || 60,
          mealsPerDay: listToText(profile.mealsPerDay)
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    const payload = {
      dietaryPreferences: textToList(form.dietaryPreferences),
      allergies: textToList(form.allergies),
      dislikedIngredients: textToList(form.dislikedIngredients),
      preferredIngredients: textToList(form.preferredIngredients),
      mealsPerDay: textToList(form.mealsPerDay),
      targetCalories: Number(form.targetCalories),
      targetProtein: Number(form.targetProtein),
      maxReadyTime: Number(form.maxReadyTime)
    };

    try {
      await profileApi.update(payload);
      setStatus("Profile saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-surface">
      {status && <div className="toast-notice">{status}</div>}
      <section className="page-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Store the rules SmartMeal should follow.</h2>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Dietary preferences
          <input
            value={form.dietaryPreferences}
            placeholder="vegetarian, high protein"
            onChange={(event) => setForm({ ...form, dietaryPreferences: event.target.value })}
          />
        </label>
        <label>
          Allergies or intolerances
          <input
            value={form.allergies}
            placeholder="peanut, gluten, dairy"
            onChange={(event) => setForm({ ...form, allergies: event.target.value })}
          />
        </label>
        <label>
          Disliked ingredients
          <input
            value={form.dislikedIngredients}
            placeholder="mushroom, tofu"
            onChange={(event) => setForm({ ...form, dislikedIngredients: event.target.value })}
          />
        </label>
        <label>
          Preferred ingredients
          <input
            value={form.preferredIngredients}
            placeholder="chicken, rice, broccoli"
            onChange={(event) => setForm({ ...form, preferredIngredients: event.target.value })}
          />
        </label>
        <label>
          Daily calories
          <input
            type="number"
            min="1000"
            value={form.targetCalories}
            onChange={(event) => setForm({ ...form, targetCalories: event.target.value })}
          />
        </label>
        <label>
          Daily protein target
          <input
            type="number"
            min="20"
            value={form.targetProtein}
            onChange={(event) => setForm({ ...form, targetProtein: event.target.value })}
          />
        </label>
        <label>
          Max cooking time
          <input
            type="number"
            min="10"
            value={form.maxReadyTime}
            onChange={(event) => setForm({ ...form, maxReadyTime: event.target.value })}
          />
        </label>
        <label>
          Meals per day
          <input
            value={form.mealsPerDay}
            placeholder="breakfast, lunch, dinner"
            onChange={(event) => setForm({ ...form, mealsPerDay: event.target.value })}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">Save profile</button>
      </form>
    </main>
  );
}

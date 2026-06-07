import { useEffect, useMemo, useState } from "react";
import { authApi, mealPlanApi, profileApi } from "../api/client";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto", "Paleo"];
const healthGoalOptions = ["Weight Loss", "Muscle Gain", "Maintain Weight", "Increase Energy", "Better Nutrition"];

const dietaryEmoji = {
  Vegetarian: "🥦",
  Vegan: "🌱",
  "Gluten-Free": "🌾",
  "Dairy-Free": "🥛",
  "Low-Carb": "🥗",
  Keto: "🥑",
  Paleo: "🍖"
};

const healthGoalEmoji = {
  "Weight Loss": "⚖️",
  "Muscle Gain": "🏋️",
  "Maintain Weight": "🎯",
  "Increase Energy": "⚡",
  "Better Nutrition": "🍽️"
};

function listOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    dietaryPreferences: [],
    healthGoals: [],
    allergies: [],
    allergyInput: "",
    dislikedIngredients: "",
    preferredIngredients: "",
    targetCalories: 2000,
    targetProtein: 90,
    maxReadyTime: 60,
    mealsPerDay: "breakfast, lunch, dinner"
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    otp: "",
    newPassword: ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(""), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    Promise.all([profileApi.get(), mealPlanApi.current()])
      .then(([profileData, mealPlanData]) => {
        const { profile, user: profileUser } = profileData;
        setForm({
          name: profileUser?.name || user?.name || "",
          dietaryPreferences: listOrEmpty(profile.dietaryPreferences),
          healthGoals: listOrEmpty(profile.healthGoals),
          allergies: listOrEmpty(profile.allergies),
          allergyInput: "",
          dislikedIngredients: listOrEmpty(profile.dislikedIngredients).join(", "),
          preferredIngredients: listOrEmpty(profile.preferredIngredients).join(", "),
          targetCalories: profile.targetCalories || 2000,
          targetProtein: profile.targetProtein || 90,
          maxReadyTime: profile.maxReadyTime || 60,
          mealsPerDay: listOrEmpty(profile.mealsPerDay).join(", ") || "breakfast, lunch, dinner"
        });
        setMealPlan(mealPlanData.mealPlan);
      })
      .catch((err) => setError(err.message));
  }, [user?.name]);

  const weeklyProgress = useMemo(() => {
    const plannedMeals = mealPlan?.meals?.length || 0;
    const configuredMeals = textToList(form.mealsPerDay);
    const goalMeals = 7 * (configuredMeals.length || 3);
    const ratio = Math.min(100, Math.round((plannedMeals / goalMeals) * 100));
    return { plannedMeals, goalMeals, ratio };
  }, [mealPlan, form.mealsPerDay]);

  const calorieTracker = useMemo(() => {
    const meals = mealPlan?.meals || [];
    const plannedCalories = meals.reduce((sum, meal) => sum + Number(meal.recipe?.nutrition?.calories || 0), 0);
    const weeklyTarget = Number(form.targetCalories || 0) * 7;
    const ratio = weeklyTarget ? Math.min(100, Math.round((plannedCalories / weeklyTarget) * 100)) : 0;

    return {
      plannedCalories,
      weeklyTarget,
      ratio
    };
  }, [mealPlan, form.targetCalories]);

  function toggleListValue(field, value) {
    setForm((current) => {
      const exists = current[field].includes(value);
      return {
        ...current,
        [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value]
      };
    });
  }

  function addAllergy() {
    const next = form.allergyInput.trim();
    if (!next || form.allergies.includes(next)) return;
    setForm((current) => ({
      ...current,
      allergies: [...current.allergies, next],
      allergyInput: ""
    }));
  }

  function removeAllergy(value) {
    setForm((current) => ({
      ...current,
      allergies: current.allergies.filter((item) => item !== value)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    const payload = {
      name: form.name.trim(),
      dietaryPreferences: form.dietaryPreferences,
      healthGoals: form.healthGoals,
      allergies: form.allergies,
      dislikedIngredients: textToList(form.dislikedIngredients),
      preferredIngredients: textToList(form.preferredIngredients),
      mealsPerDay: textToList(form.mealsPerDay),
      targetCalories: Number(form.targetCalories),
      targetProtein: Number(form.targetProtein),
      maxReadyTime: Number(form.maxReadyTime)
    };

    try {
      const data = await profileApi.update(payload);
      if (data.user) {
        updateUser(data.user);
      }
      setStatus("Profile saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function requestPasswordOtp() {
    setPasswordStatus("");
    setPasswordError("");
    setPasswordLoading(true);

    try {
      const data = await authApi.requestPasswordOtp({ email: user.email });
      setPasswordStatus(data.devOtp ? `${data.message} Development OTP: ${data.devOtp}` : data.message);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordStatus("");
    setPasswordError("");
    setPasswordLoading(true);

    try {
      const payload = {
        newPassword: passwordForm.newPassword
      };

      if (passwordForm.currentPassword) {
        payload.currentPassword = passwordForm.currentPassword;
      } else {
        payload.otp = passwordForm.otp;
      }

      const data = await authApi.changePassword(payload);
      setPasswordStatus(data.message);
      setPasswordForm({ currentPassword: "", otp: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <main className="page-surface">
      {status && <div className="toast-notice">{status}</div>}
      <section className="panel-shell">
        <div className="page-heading">
          <div>
            <h2>Profile &amp; Goals</h2>
          </div>
        </div>

        <form className="profile-stack" onSubmit={handleSubmit}>
          <div className="profile-two-up">
            <article className="profile-card">
              <div className="card-heading">
                <Icon name="profile" className="section-icon" />
                <h3>Personal Information</h3>
              </div>
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            </article>

            <article className="profile-card">
              <div className="card-heading">
                <Icon name="progress" className="section-icon" />
                <h3>Weekly Progress</h3>
              </div>
              <div className="progress-meta">
                <span>Meals Planned</span>
                <strong>
                  {weeklyProgress.plannedMeals} / {weeklyProgress.goalMeals}
                </strong>
              </div>
              <div className="progress-bar">
                <div style={{ width: `${weeklyProgress.ratio}%` }} />
              </div>
              <p className="card-note">
                {Math.max(0, weeklyProgress.goalMeals - weeklyProgress.plannedMeals)} more meals to reach your weekly goal
              </p>
            </article>
          </div>

          <article className="profile-card">
            <div className="card-heading">
              <Icon name="target" className="section-icon" />
              <h3>Calorie Tracker</h3>
            </div>
            <div className="progress-meta">
              <span>Planned Recipe Calories</span>
              <strong>
                {calorieTracker.plannedCalories} / {calorieTracker.weeklyTarget || 0} kcal
              </strong>
            </div>
            <div className="progress-bar">
              <div style={{ width: `${calorieTracker.ratio}%` }} />
            </div>
            <p className="card-note">
              Calories are calculated from recipes in your current weekly plan.
            </p>
          </article>

          <article className="profile-card">
            <div className="card-heading">
              <Icon name="target" className="section-icon" />
              <h3>Dietary Preferences</h3>
            </div>
            <div className="option-grid">
              {dietaryOptions.map((option) => (
                <label className="check-option" key={option}>
                  <input
                    type="checkbox"
                    checked={form.dietaryPreferences.includes(option)}
                    onChange={() => toggleListValue("dietaryPreferences", option)}
                  />
                  <span>
                    {dietaryEmoji[option]} {option}
                  </span>
                </label>
              ))}
            </div>
          </article>

          <article className="profile-card">
            <div className="card-heading">
              <Icon name="target" className="section-icon" />
              <h3>Health Goals</h3>
            </div>
            <div className="option-grid">
              {healthGoalOptions.map((option) => (
                <label className="check-option" key={option}>
                  <input
                    type="checkbox"
                    checked={form.healthGoals.includes(option)}
                    onChange={() => toggleListValue("healthGoals", option)}
                  />
                  <span>
                    {healthGoalEmoji[option]} {option}
                  </span>
                </label>
              ))}
            </div>
          </article>

          <article className="profile-card">
            <div className="card-heading card-heading-alert">
              <Icon name="alert" className="section-icon" />
              <h3>Allergies &amp; Restrictions</h3>
            </div>
            <div className="allergy-row">
              <input
                value={form.allergyInput}
                placeholder="Add allergy (e.g., peanuts, dairy)"
                onChange={(event) => setForm({ ...form, allergyInput: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addAllergy();
                  }
                }}
              />
              <button type="button" className="secondary-button" onClick={addAllergy}>
                Add
              </button>
            </div>
            <div className="chip-row">
              {form.allergies.map((item) => (
                <button type="button" className="allergy-chip" key={item} onClick={() => removeAllergy(item)}>
                  {item} <span>x</span>
                </button>
              ))}
            </div>
          </article>

          <article className="profile-card">
            <div className="card-heading">
              <h3>Planner Settings</h3>
            </div>
            <div className="planner-settings-grid">
              <label>
                Preferred ingredients
                <input
                  value={form.preferredIngredients}
                  placeholder="chicken, rice, broccoli"
                  onChange={(event) => setForm({ ...form, preferredIngredients: event.target.value })}
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
            </div>
          </article>

          {error && <p className="form-error inline-message">{error}</p>}

          <div className="profile-submit-row">
            <button type="submit">Save Changes</button>
          </div>
        </form>

        <form className="profile-stack password-stack" onSubmit={handlePasswordSubmit}>
          <article className="profile-card">
            <div className="card-heading">
              <Icon name="profile" className="section-icon" />
              <h3>Change Password</h3>
            </div>
            <div className="planner-settings-grid">
              <label>
                Current password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  placeholder="Use this or email OTP"
                />
              </label>
              <label>
                Email OTP
                <input
                  inputMode="numeric"
                  value={passwordForm.otp}
                  onChange={(event) => setPasswordForm({ ...passwordForm, otp: event.target.value })}
                  placeholder="Use this if you forgot old password"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  required
                />
              </label>
              <div className="password-actions">
                <button type="button" className="secondary-button" onClick={requestPasswordOtp} disabled={passwordLoading}>
                  Send OTP
                </button>
                <button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </div>
            {passwordError && <p className="form-error inline-message">{passwordError}</p>}
            {passwordStatus && <p className="form-status inline-message">{passwordStatus}</p>}
          </article>
        </form>
      </section>
    </main>
  );
}

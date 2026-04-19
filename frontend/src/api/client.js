function normalizeApiUrl(raw) {
  const fallback = "http://localhost:5000/api";
  const value = (raw || fallback).trim();

  try {
    const url = new URL(value);

    // If the user sets only the origin (like https://xyz.onrender.com),
    // automatically target /api.
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/api";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return value.replace(/\/$/, "");
  }
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

function getToken() {
  return localStorage.getItem("smartmeal_token");
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const authApi = {
  register(payload) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me() {
    return apiFetch("/auth/me");
  }
};

export const profileApi = {
  get() {
    return apiFetch("/profile");
  },
  update(payload) {
    return apiFetch("/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }
};

export const recipeApi = {
  search(params) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/recipes/search?${query}`);
  },
  get(id) {
    return apiFetch(`/recipes/${id}`);
  },
  save(recipe) {
    return apiFetch("/recipes/saved", {
      method: "POST",
      body: JSON.stringify(recipe)
    });
  },
  saved() {
    return apiFetch("/recipes/saved");
  },
  removeSaved(id) {
    return apiFetch(`/recipes/saved/${id}`, {
      method: "DELETE"
    });
  }
};

export const mealPlanApi = {
  current() {
    return apiFetch("/meal-plans/current");
  },
  history() {
    return apiFetch("/meal-plans/history");
  },
  generate(payload = {}) {
    return apiFetch("/meal-plans/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  addRecipeToCurrent(recipe, payload = {}) {
    return apiFetch("/meal-plans/current/meals", {
      method: "POST",
      body: JSON.stringify({ recipe, ...payload })
    });
  },
  removeMeal(planId, mealId) {
    return apiFetch(`/meal-plans/${planId}/meals/${mealId}`, {
      method: "DELETE"
    });
  },
  clearDay(planId, date) {
    return apiFetch(`/meal-plans/${planId}/days`, {
      method: "DELETE",
      body: JSON.stringify({ date })
    });
  },
  clearWeek(planId) {
    return apiFetch(`/meal-plans/${planId}`, {
      method: "DELETE"
    });
  },
  toggleGrocery(planId, itemId, purchased) {
    return apiFetch(`/meal-plans/${planId}/grocery/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ purchased })
    });
  },
  togglePrep(planId, taskId, done) {
    return apiFetch(`/meal-plans/${planId}/prep/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ done })
    });
  }
};

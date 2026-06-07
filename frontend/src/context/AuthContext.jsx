import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem("smartmeal_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("smartmeal_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("smartmeal_token")));

  useEffect(() => {
    const token = localStorage.getItem("smartmeal_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("smartmeal_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("smartmeal_token");
        localStorage.removeItem("smartmeal_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAuth(request) {
    const data = await request;
    updateUser(data.user);
    localStorage.setItem("smartmeal_token", data.token);
    return data;
  }

  function updateUser(nextUser) {
    localStorage.setItem("smartmeal_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register(payload) {
        return handleAuth(authApi.register(payload));
      },
      login(payload) {
        return handleAuth(authApi.login(payload));
      },
      logout() {
        localStorage.removeItem("smartmeal_token");
        localStorage.removeItem("smartmeal_user");
        setUser(null);
      },
      updateUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

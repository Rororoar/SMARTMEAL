import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("smartmeal_user");
    return stored ? JSON.parse(stored) : null;
  });
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
    localStorage.setItem("smartmeal_token", data.token);
    localStorage.setItem("smartmeal_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
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
      }
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


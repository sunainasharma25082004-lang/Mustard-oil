import { createContext, useContext, useEffect, useState } from "react";
import { authApi, TOKEN_KEY } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((res) => {
        if (res.data.user.role !== "admin") {
          localStorage.removeItem(TOKEN_KEY);
          return;
        }
        setUser(res.data.user);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.user.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.");
      }
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setUser(res.data.user);
      return res;
    } catch (err) {
      if (/too many requests/i.test(err.message)) {
        throw new Error("Login failed. Please wait a moment and try again.");
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

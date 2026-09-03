import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "psch.session";

function readStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    setSession(result);
    persistSession(result);
    return result;
  }, []);

  const loginWithSso = useCallback(async () => {
    const result = await authApi.loginWithSso();
    setSession(result);
    persistSession(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    persistSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: !!session?.user,
      isInternalStaff: session?.user?.role === "internal_staff",
      isSupplier: session?.user?.role === "supplier",
      login,
      loginWithSso,
      logout,
    }),
    [session, login, loginWithSso, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

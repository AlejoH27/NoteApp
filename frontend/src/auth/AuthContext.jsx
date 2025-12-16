import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(authApi.isLoggedIn());

  const value = useMemo(
    () => ({
      isAuth,
      async login(email, password) {
        await authApi.login(email, password);
        setIsAuth(true);
      },
      logout() {
        authApi.logout();
        setIsAuth(false);
      },
    }),
    [isAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
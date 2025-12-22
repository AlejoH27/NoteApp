import { createContext, useContext, useMemo, useState } from "react";
import { login as doLogin } from "./login";
import { logout as doLogout } from "./logouth";

const AuthContext = createContext(null);

const hasTokens = () =>
  !!localStorage.getItem("access") && !!localStorage.getItem("refresh");

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(hasTokens());

  const value = useMemo(
    () => ({
      isAuth,
      async login(username, password) {
        await doLogin(username, password);
        setIsAuth(true);
      },
      async logout() {
        await doLogout();
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
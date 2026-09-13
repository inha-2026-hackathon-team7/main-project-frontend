import { createContext, useContext, useMemo, useState } from "react";
import { clearAuthSession, getAuthSession, setAuthSession } from "../services/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getAuthSession());

  const value = useMemo(() => ({
    user: session.user,
    accessToken: session.accessToken,
    login: (user, accessToken) => {
      setAuthSession(user, accessToken);
      setSession({ user, accessToken });
    },
    logout: () => {
      clearAuthSession();
      setSession({ user: null, accessToken: null });
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("starton_current_user");
      return saved ? JSON.parse(saved) : { id: "u_demo123", name: "김도장", email: "demo@example.com", role: "user" };
    } catch {
      return { id: "u_demo123", name: "김도장", email: "demo@example.com", role: "user" };
    }
  });

  const value = useMemo(() => ({
    user,
    login: (u) => {
      setUser(u);
      try { localStorage.setItem("starton_current_user", JSON.stringify(u)); } catch {}
    },
    logout: () => {
      setUser(null);
      try { localStorage.removeItem("starton_current_user"); } catch {}
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

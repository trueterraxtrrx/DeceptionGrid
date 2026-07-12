import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, DEMO_MODE } from "@/api";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("dg_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      authApi.me().then(setUser).finally(() => setLoading(false));
      return;
    }
    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem("dg_token"); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem("dg_token", t);
    setToken(t);
  };
  const logout = () => {
    localStorage.removeItem("dg_token");
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
// Project version: DeceptionGrid V1.6



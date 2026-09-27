"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AuthUser = {
  id: string;
  email: string;
  verificationStatus: "pending" | "approved" | "rejected";
  tier: "free" | "cosmic" | "nebula";
} | null;

type AuthContextValue = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { isLocale } from "@/i18n/config";
import { setLocaleCookie } from "@/lib/locale";

import { ApiError, clearTokens, getTokens, setTokens } from "@/services/apiClient";
import * as authService from "@/services/authService";
import type { Profile } from "@/services/authService";

type SessionStatus = "loading" | "guest" | "needs_onboarding" | "authenticated";

type AuthContextValue = {
  status: SessionStatus;
  profile: Profile | null;
  register: (name: string, email: string, password: string) => Promise<SessionStatus>;
  login: (email: string, password: string) => Promise<SessionStatus>;
  logout: () => void;
  refreshProfile: () => Promise<SessionStatus>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const locale = useLocale();
  const router = useRouter();

  const loadProfile = async (): Promise<SessionStatus> => {
    try {
      const me = await authService.fetchMyProfile();
      setProfile(me);
      setStatus("authenticated");
      // el idioma guardado en la cuenta manda: si difiere del de este navegador, se cambia una sola vez
      if (isLocale(me.language) && me.language !== locale) {
        setLocaleCookie(me.language);
        router.refresh();
      }
      return "authenticated";
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setProfile(null);
        setStatus("needs_onboarding");
        return "needs_onboarding";
      }
      // token inválido/expirado sin refresh posible -- vuelve a invitado
      clearTokens();
      setProfile(null);
      setStatus("guest");
      return "guest";
    }
  };

  useEffect(() => {
    if (getTokens()) {
      loadProfile();
    } else {
      setStatus("guest");
    }
  }, []);

  const register = async (name: string, email: string, password: string): Promise<SessionStatus> => {
    const tokens = await authService.register(name, email, password, locale);
    setTokens(tokens);
    setStatus("needs_onboarding");
    return "needs_onboarding";
  };

  const login = async (email: string, password: string): Promise<SessionStatus> => {
    const tokens = await authService.login(email, password);
    setTokens(tokens);
    return loadProfile();
  };

  const logout = () => {
    clearTokens();
    setProfile(null);
    setStatus("guest");
  };

  return (
    <AuthContext.Provider value={{ status, profile, register, login, logout, refreshProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}

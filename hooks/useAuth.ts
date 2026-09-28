import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const { status, profile, register, login, logout, refreshProfile } = useAuthContext();

  return {
    status,
    profile,
    isAuthenticated: status === "authenticated",
    needsOnboarding: status === "needs_onboarding",
    isVerified: profile?.verification_status === "approved",
    register,
    login,
    logout,
    refreshProfile,
  };
}

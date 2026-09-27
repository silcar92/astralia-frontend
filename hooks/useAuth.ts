import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, setUser } = useAuthContext();

  return {
    user,
    isAuthenticated: user !== null,
    isVerified: user?.verificationStatus === "approved",
    setUser,
  };
}

import { apiFetch, type AuthTokens } from "./apiClient";

export function register(name: string, email: string, password: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/api/v1/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthTokens> {
  // el backend crea el username = email en el registro (apps/accounts/serializers.py::RegisterSerializer)
  return apiFetch<AuthTokens>("/api/v1/accounts/token/", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
}

export type Profile = {
  id: number;
  name: string;
  age: number;
  interest_names: string[];
  city: string;
  country: string;
  age_segment: "youth" | "adult";
  tier: "free" | "cosmic" | "nebula";
  verification_status: "pending" | "approved" | "rejected";
  bio: string;
  is_approved_community_creator: boolean;
};

export function fetchMyProfile(): Promise<Profile> {
  return apiFetch<Profile>("/api/v1/accounts/profile/me/");
}

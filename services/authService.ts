import { apiFetch, type AuthTokens } from "./apiClient";

export function register(name: string, email: string, password: string, language: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/api/v1/accounts/register/", {
    method: "POST",
    body: JSON.stringify({ name, email, password, language }),
  });
}

export function login(email: string, password: string): Promise<AuthTokens> {
  // el backend crea el username = email en el registro (apps/accounts/serializers.py::RegisterSerializer)
  return apiFetch<AuthTokens>("/api/v1/accounts/token/", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
}

export function forgotPassword(email: string): Promise<{ detail: string }> {
  return apiFetch("/api/v1/accounts/password/forgot/", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(uid: string, token: string, password: string): Promise<{ detail: string }> {
  return apiFetch("/api/v1/accounts/password/reset/", { method: "POST", body: JSON.stringify({ uid, token, password }) });
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ detail: string }> {
  return apiFetch("/api/v1/accounts/password/change/", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export function verifyEmail(token: string): Promise<{ verified: boolean }> {
  return apiFetch("/api/v1/accounts/email/verify/", { method: "POST", body: JSON.stringify({ token }) });
}

export function resendVerification(): Promise<{ sent?: boolean; already_verified?: boolean }> {
  return apiFetch("/api/v1/accounts/email/resend/", { method: "POST" });
}

export type InterestItem = { code: string; name: string };

export type Profile = {
  id: number;
  email_verified: boolean;
  language: string;
  name: string;
  age: number;
  interest_names: string[];
  interest_items: InterestItem[];
  interests: number[];
  friendship_goals: number[];
  conversation_depth: string;
  group_preference: string;
  city: string;
  country: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string;
  birth_timezone: string;
  age_segment: "youth" | "adult";
  tier: "free" | "cosmic" | "nebula";
  verification_status: "pending" | "approved" | "rejected";
  bio: string;
  is_approved_community_creator: boolean;
};

export function fetchMyProfile(): Promise<Profile> {
  return apiFetch<Profile>("/api/v1/accounts/profile/me/");
}

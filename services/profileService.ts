import { apiFetch } from "./apiClient";
import type { Profile } from "./authService";

export type Interest = { id: number; code: string; name: string; category: string };
export type FriendshipGoal = { id: number; code: string; label: string };

export function fetchInterests(): Promise<{ results: Interest[] }> {
  return apiFetch("/api/v1/accounts/interests/");
}

export function fetchFriendshipGoals(): Promise<{ results: FriendshipGoal[] }> {
  return apiFetch("/api/v1/accounts/friendship-goals/");
}

export type CreateProfilePayload = {
  birth_date: string;
  birth_time?: string;
  birth_place: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  city: string;
  country: string;
  current_latitude?: number;
  current_longitude?: number;
  interests: number[];
  friendship_goals: number[];
  conversation_depth: string;
  group_preference: string;
  consent_accepted: boolean;
};

export function createProfile(payload: CreateProfilePayload) {
  return apiFetch("/api/v1/accounts/profile/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateProfilePayload = Partial<{
  name: string;
  bio: string;
  language: string;
  city: string;
  country: string;
  current_latitude: number;
  current_longitude: number;
  interests: number[];
  friendship_goals: number[];
  conversation_depth: string;
  group_preference: string;
  birth_time: string | null;
  birth_place: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
}>;

export function updateProfile(payload: UpdateProfilePayload) {
  return apiFetch<Profile>("/api/v1/accounts/profile/me/", { method: "PATCH", body: JSON.stringify(payload) });
}

export function updateBio(bio: string) {
  return updateProfile({ bio });
}

export type ConnectionState = {
  status: "none" | "pending_sent" | "pending_received" | "connected";
  id: number | null;
};

export type PublicProfile =
  | { is_me: true }
  | {
      is_me: false;
      user_id: number;
      name: string;
      age: number;
      city: string;
      country: string;
      bio: string;
      interest_names: string[];
      interest_items: { code: string; name: string }[];
      shared_interests: { code: string; name: string }[];
      chart_highlights: { sun?: string; moon?: string; ascendant?: string };
      cosmic_name: string | null;
      compatibility_pct: number;
      explanation: string;
      explanation_data?: { dimension?: string; shared?: { code: string; name: string }[] } | null;
      connection: ConnectionState;
    };

export function fetchPublicProfile(userId: number): Promise<PublicProfile> {
  return apiFetch(`/api/v1/accounts/profiles/${userId}/`);
}

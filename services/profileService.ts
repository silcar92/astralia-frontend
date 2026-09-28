import { apiFetch } from "./apiClient";

export type Interest = { id: number; name: string; category: string };
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

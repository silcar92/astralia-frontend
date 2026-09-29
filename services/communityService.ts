import { apiFetch } from "./apiClient";

export type MembershipStatus = "approved" | "pending" | "rejected" | null;

export type Community = {
  id: number;
  name: string;
  slug: string;
  description: string;
  visibility: "public" | "private";
  age_segment: "youth" | "adult";
  member_count: number;
  my_status: MembershipStatus;
  created_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchCommunities(mine = false): Promise<Paginated<Community>> {
  return apiFetch(`/api/v1/communities/?page_size=100${mine ? "&mine=1" : ""}`);
}

export function fetchCommunity(id: number): Promise<Community> {
  return apiFetch(`/api/v1/communities/${id}/`);
}

export function joinCommunity(id: number): Promise<{ status: Exclude<MembershipStatus, null> }> {
  return apiFetch(`/api/v1/communities/${id}/join/`, { method: "POST" });
}

export function leaveCommunity(id: number): Promise<void> {
  return apiFetch(`/api/v1/communities/${id}/leave/`, { method: "POST" });
}

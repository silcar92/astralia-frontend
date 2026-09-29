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
  is_moderator: boolean;
  pending_count: number | null;
  is_creator: boolean;
  closed_at: string | null;
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

export function createCommunity(payload: {
  name: string;
  description: string;
  visibility: "public" | "private";
}): Promise<Community> {
  return apiFetch("/api/v1/communities/", { method: "POST", body: JSON.stringify(payload) });
}

export type MembershipRequest = { id: number; user_name: string; requested_at: string };

export function fetchRequests(communityId: number): Promise<Paginated<MembershipRequest>> {
  return apiFetch(`/api/v1/communities/${communityId}/requests/?page_size=100`);
}

export function decideRequest(communityId: number, membershipId: number, action: "approve" | "reject") {
  return apiFetch<{ id: number; status: string }>(`/api/v1/communities/${communityId}/requests/${membershipId}/`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export type CommunityMember = {
  id: number;
  user_id: number;
  user_name: string;
  is_moderator: boolean;
  is_creator: boolean;
  is_me: boolean;
  joined_at: string;
};

export function fetchMembers(communityId: number): Promise<Paginated<CommunityMember>> {
  return apiFetch(`/api/v1/communities/${communityId}/members/?page_size=100`);
}

export function setModerator(communityId: number, membershipId: number, isModerator: boolean) {
  return apiFetch<{ id: number; is_moderator: boolean }>(`/api/v1/communities/${communityId}/members/${membershipId}/moderator/`, {
    method: "POST",
    body: JSON.stringify({ is_moderator: isModerator }),
  });
}

export function transferCommunity(communityId: number, membershipId: number): Promise<void> {
  return apiFetch(`/api/v1/communities/${communityId}/transfer/`, {
    method: "POST",
    body: JSON.stringify({ membership_id: membershipId }),
  });
}

export function closeCommunity(communityId: number): Promise<void> {
  return apiFetch(`/api/v1/communities/${communityId}/close/`, { method: "POST" });
}

import { apiFetch } from "./apiClient";

export type RsvpStatus = "going" | "waitlisted" | null;

export type AstraliaEvent = {
  id: number;
  title: string;
  description: string;
  format: "online" | "in_person";
  location: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  requires_verification: boolean;
  age_segment: "youth" | "adult";
  community: number | null;
  community_name: string | null;
  organizer_name: string;
  is_organizer: boolean;
  going_count: number;
  is_full: boolean;
  my_status: RsvpStatus;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchEvents(mine = false): Promise<Paginated<AstraliaEvent>> {
  return apiFetch(`/api/v1/events/?page_size=100${mine ? "&mine=1" : ""}`);
}

export function fetchEvent(id: number): Promise<AstraliaEvent> {
  return apiFetch(`/api/v1/events/${id}/`);
}

export type CreateEventPayload = {
  title: string;
  description: string;
  format: "online" | "in_person";
  location: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  community?: number;
};

export function createEvent(payload: CreateEventPayload): Promise<AstraliaEvent> {
  return apiFetch("/api/v1/events/", { method: "POST", body: JSON.stringify(payload) });
}

export function rsvp(id: number): Promise<{ status: Exclude<RsvpStatus, null>; going_count: number }> {
  return apiFetch(`/api/v1/events/${id}/rsvp/`, { method: "POST" });
}

export function cancelRsvp(id: number): Promise<void> {
  return apiFetch(`/api/v1/events/${id}/rsvp/`, { method: "DELETE" });
}

export function cancelEvent(id: number): Promise<void> {
  return apiFetch(`/api/v1/events/${id}/`, { method: "DELETE" });
}

import { apiFetch } from "./apiClient";

export type AppNotification = {
  id: number;
  type: string;
  body: string;
  target_type: string;
  target_id: number | null;
  read_at: string | null;
  created_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchNotifications(): Promise<Paginated<AppNotification>> {
  return apiFetch("/api/v1/notifications/?page_size=100");
}

export function fetchUnreadCount(): Promise<{ unread: number }> {
  return apiFetch("/api/v1/notifications/unread-count/");
}

export function markRead(id: number): Promise<{ read_at: string }> {
  return apiFetch(`/api/v1/notifications/${id}/read/`, { method: "POST" });
}

export function markAllRead(): Promise<void> {
  return apiFetch("/api/v1/notifications/read-all/", { method: "POST" });
}

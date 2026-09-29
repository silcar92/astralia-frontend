import { apiFetch } from "./apiClient";

export function acceptConnection(connectionId: number): Promise<{ id: number; status: string }> {
  return apiFetch(`/api/v1/connections/${connectionId}/accept/`, { method: "POST" });
}

export function requestConnection(recipientId: number): Promise<{ id: number; status: string }> {
  return apiFetch("/api/v1/connections/request/", { method: "POST", body: JSON.stringify({ recipient_id: recipientId }) });
}

import { apiFetch } from "./apiClient";

export type Conversation = {
  id: number;
  other_user_id: number;
  other_user_name: string;
  last_message: { text: string; content_type: string; sent_at: string; sender_id: number } | null;
  unread_count: number;
};

export type ChatMessage = {
  id: number;
  connection: number;
  sender: number;
  is_mine: boolean;
  content_type: "text" | "image" | "gif" | "voice";
  text: string;
  media: string | null;
  sent_at: string;
  read_at: string | null;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchConversations(): Promise<Paginated<Conversation>> {
  return apiFetch("/api/v1/chat/conversations/");
}

export function fetchConversation(connectionId: number): Promise<Conversation> {
  return apiFetch(`/api/v1/chat/conversations/${connectionId}/`);
}

export function fetchMessages(connectionId: number): Promise<Paginated<ChatMessage>> {
  return apiFetch(`/api/v1/chat/${connectionId}/messages/?page_size=100`);
}

export function sendMessage(connectionId: number, text: string): Promise<ChatMessage> {
  return apiFetch(`/api/v1/chat/${connectionId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function markAllRead(connectionId: number): Promise<{ marked_read: number }> {
  return apiFetch(`/api/v1/chat/${connectionId}/read-all/`, { method: "POST" });
}

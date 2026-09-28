import { apiFetch } from "./apiClient";

export type CosmosPost = {
  id: number;
  author: number | null;
  author_name: string | null;
  is_mine: boolean;
  community: number | null;
  content_type: "text" | "photo" | "video" | "poll" | "story";
  text: string;
  media: string | null;
  is_ad: boolean;
  reaction_count: number;
  my_reaction: string | null;
  expires_at: string | null;
  created_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchFeed(): Promise<Paginated<CosmosPost>> {
  return apiFetch("/api/v1/cosmos/feed/?page_size=50");
}

export function fetchStories(): Promise<Paginated<CosmosPost>> {
  return apiFetch("/api/v1/cosmos/stories/?page_size=50");
}

export function createPost(text: string, contentType: "text" | "story"): Promise<CosmosPost> {
  return apiFetch("/api/v1/cosmos/feed/", {
    method: "POST",
    body: JSON.stringify({ content_type: contentType, text }),
  });
}

export function toggleLike(postId: number): Promise<{ type: string | null; reaction_count: number }> {
  return apiFetch(`/api/v1/cosmos/${postId}/react/`, {
    method: "POST",
    body: JSON.stringify({ type: "like" }),
  });
}

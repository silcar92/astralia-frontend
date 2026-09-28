import { apiFetch } from "./apiClient";

export type SuggestionCard = {
  id: number;
  name: string;
  age: number;
  city: string;
  country: string;
  distance_km: number | null;
  chart_highlights: { sun?: string; moon?: string; ascendant?: string };
  shared_interests: string[];
  compatibility_score: string;
  compatibility_label: "alta" | "media" | "baja";
  explanation: string;
  action: "pending" | "connected" | "passed";
  shown_at: string;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchDiscoverSuggestions(): Promise<Paginated<SuggestionCard>> {
  return apiFetch("/api/v1/discovery/discover/");
}

export function fetchStormSuggestions(): Promise<Paginated<SuggestionCard>> {
  return apiFetch("/api/v1/discovery/storm/");
}

export function decideSuggestion(id: number, action: "connected" | "passed") {
  return apiFetch(`/api/v1/discovery/${id}/decide/`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

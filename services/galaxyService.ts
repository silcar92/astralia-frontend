import { apiFetch } from "./apiClient";

export type GalaxyStar = {
  id: number;
  other_user_id: number;
  name: string;
  size: string | null;
  brightness: number;
  sparkle: boolean;
  category: string;
  responded_at: string | null;
};

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export function fetchGalaxy(): Promise<Paginated<GalaxyStar>> {
  return apiFetch("/api/v1/connections/galaxy/");
}

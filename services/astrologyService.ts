import { apiFetch } from "./apiClient";

export type Placement = { body: string; longitude: string; sign: string; house: number | null; retrograde: boolean };
export type NatalChart = { computed_at: string; placements: Placement[]; house_cusps: unknown[] };

export function fetchMyNatalChart(): Promise<NatalChart> {
  return apiFetch("/api/v1/astrology/me/");
}

export function findPlacement(chart: NatalChart, body: string): Placement | undefined {
  return chart.placements.find((p) => p.body === body);
}

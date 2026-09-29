import { apiFetch } from "./apiClient";

export type PersonalityItem = { id: number; key: string; dimension: string; text: string };
export type PersonalityResult = { mbti_code: string; cosmic_name: string; test_length: string; computed_at: string };

export async function fetchPersonalityItems(length: "short" | "medium" | "full"): Promise<PersonalityItem[]> {
  // Paginación por defecto de DRF (PAGE_SIZE=20) -- el banco corto (16) entra en una página,
  // el completo (64) no, así que hay que recorrer todas las páginas.
  const items: PersonalityItem[] = [];
  let url: string | null = `/api/v1/personality/items/?length=${length}&page_size=100`;
  while (url) {
    const page: { results: PersonalityItem[]; next: string | null } = await apiFetch(url);
    items.push(...page.results);
    url = page.next ? page.next.replace(/^https?:\/\/[^/]+/, "") : null;
  }
  return items;
}

export function submitPersonalityTest(
  testLength: "short" | "medium" | "full",
  answers: Record<number, number>
): Promise<PersonalityResult> {
  return apiFetch("/api/v1/personality/submit/", {
    method: "POST",
    body: JSON.stringify({ test_length: testLength, answers }),
  });
}

export function fetchMyPersonalityResult(): Promise<PersonalityResult> {
  return apiFetch("/api/v1/personality/result/");
}

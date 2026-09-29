"use client";

import { useTranslations } from "next-intl";

// Etiquetas traducidas de los datos que llegan del backend como códigos (signos, intereses, metas, preferencias).
// Si un código no tiene traducción se usa el nombre que mandó el backend (p. ej. intereses libres).
export function useCatalog() {
  const t = useTranslations("catalog");

  const pick = (group: string, code: string | undefined | null, fallback: string) =>
    code && t.has(`${group}.${code}`) ? t(`${group}.${code}`) : fallback;

  return {
    sign: (sign?: string | null) => pick("signs", sign, sign ?? "—"),
    body: (body: string) => pick("bodies", body, body),
    interest: (interest: { code?: string; name: string }) => pick("interests", interest.code, interest.name),
    goal: (goal: { code?: string; label: string }) => pick("goals", goal.code, goal.label),
    depth: (value: string) => pick("depth", value, value),
    group: (value: string) => pick("group", value, value),
  };
}

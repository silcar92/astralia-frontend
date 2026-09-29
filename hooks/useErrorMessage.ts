"use client";

import { useTranslations } from "next-intl";

import { ApiError } from "@/services/apiClient";

// Primer código de error de campo ({"codes": {"email": ["email_taken"]}}) que mande el backend
function firstFieldCode(error: ApiError): string | null {
  const codes = (error.body as { codes?: unknown } | null)?.codes;
  const walk = (value: unknown): string | null => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(walk).find(Boolean) ?? null;
    if (value && typeof value === "object") return Object.values(value).map(walk).find(Boolean) ?? null;
    return null;
  };
  return walk(codes);
}

// Convierte un error de la API en un texto traducido. Prioridad: código estable del backend > tipo de fallo > genérico.
export function useErrorMessage() {
  const t = useTranslations("errors");

  return (error: unknown, fallbackKey: string = "generic"): string => {
    if (error instanceof ApiError) {
      if (error.code && t.has(error.code)) return t(error.code);
      const fieldCode = firstFieldCode(error);
      if (fieldCode && t.has(`fields.${fieldCode}`)) return t(`fields.${fieldCode}`);
      if (error.status === 429) return t("too_many_attempts");
      if (error.status === 401) return t("unauthorized");
      if (error.status >= 500) return t("server");
      return t.has(fallbackKey) ? t(fallbackKey) : t("generic");
    }
    return t("network");
  };
}

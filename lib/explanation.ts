"use client";

import { useLocale, useTranslations } from "next-intl";

import { useCatalog } from "@/hooks/useCatalog";

export type ExplanationData = { dimension?: string; shared?: { code: string; name: string }[] } | null | undefined;

// "Por qué te sugerimos a esta persona" en el idioma de quien lo lee. Las sugerencias antiguas no tienen datos
// estructurados y usan el texto que se guardó al crearlas.
export function useExplanation() {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const catalog = useCatalog();

  return (data: ExplanationData, fallbackText: string): string => {
    if (!data?.dimension) return fallbackText;

    const phrase = t.has(`dimension.${data.dimension}`) ? t(`dimension.${data.dimension}`) : "";
    if (!phrase) return fallbackText;

    const shared = data.shared ?? [];
    if (shared.length > 0) {
      const interests = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(shared.map((i) => catalog.interest(i)));
      return t("explanation.withInterests", { interests, phrase });
    }
    const sentence = t("explanation.withoutInterests", { phrase });
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };
}

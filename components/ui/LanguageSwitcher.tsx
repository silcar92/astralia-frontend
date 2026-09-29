"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { LOCALES, type Locale } from "@/i18n/config";
import { useAuth } from "@/hooks/useAuth";
import { setLocaleCookie } from "@/lib/locale";
import * as profileService from "@/services/profileService";

// Cambia el idioma de la interfaz. Con sesión iniciada también lo guarda en la cuenta (correos y avisos futuros).
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const { status } = useAuth();

  const change = (next: Locale) => {
    setLocaleCookie(next);
    if (status === "authenticated") profileService.updateProfile({ language: next }).catch(() => {});
    router.refresh();
  };

  return (
    <label className={`inline-flex items-center gap-2 text-[11px] ${className}`} style={{ color: "var(--astralia-lilac)" }}>
      <span>{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => change(e.target.value as Locale)}
        className="rounded-full px-3 py-1.5 text-[11px] outline-none"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} style={{ color: "#241A3D" }}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

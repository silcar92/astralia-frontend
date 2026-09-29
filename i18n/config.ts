// Idiomas de la interfaz. Para agregar uno: 1) sumarlo aquí, 2) crear messages/<código>/ con los mismos archivos que
// messages/es (lo que falte se muestra en español), 3) sumar su código a SUPPORTED_LANGUAGES en el backend
// (config/settings.py) y sus textos de correo en apps/common/i18n.py.
export const LOCALES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "astralia_locale";

// Un archivo por área en messages/<idioma>/<área>.json
export const NAMESPACES = [
  "common", "errors", "nav", "auth", "onboarding", "discover", "galaxy", "chat", "cosmos",
  "communities", "events", "notifications", "profile", "people", "catalog", "personality", "time",
] as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

// Cookie explícita > idioma del navegador (Accept-Language) > español
export function pickLocale(cookie: string | undefined, acceptLanguage: string | null | undefined): Locale {
  if (isLocale(cookie)) return cookie;
  for (const part of (acceptLanguage ?? "").split(",")) {
    const code = part.trim().split(";")[0].toLowerCase().split("-")[0];
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

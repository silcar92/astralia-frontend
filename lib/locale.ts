import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

// El servidor lee esta cookie en cada petición (i18n/request.ts) para renderizar en el idioma elegido.
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

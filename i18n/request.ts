import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, NAMESPACES, pickLocale, type Locale } from "./config";

type Messages = Record<string, unknown>;

async function load(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => {
      try {
        return [ns, (await import(`../messages/${locale}/${ns}.json`)).default] as const;
      } catch {
        return [ns, {}] as const; // el idioma aún no tiene esa área: se usa la del idioma por defecto
      }
    })
  );
  return Object.fromEntries(entries);
}

function merge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      value && typeof value === "object" && current && typeof current === "object"
        ? merge(current as Messages, value as Messages)
        : value;
  }
  return out;
}

export default getRequestConfig(async () => {
  const locale = pickLocale((await cookies()).get(LOCALE_COOKIE)?.value, (await headers()).get("accept-language"));
  const base = await load(DEFAULT_LOCALE);
  return { locale, messages: locale === DEFAULT_LOCALE ? base : merge(base, await load(locale)) };
});

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// Vuelve a la pantalla de donde se venía (Cosmos, Galaxia, chat...). Solo cae en `fallback` si no hay historial
// dentro de la sesión, por ejemplo al abrir el perfil desde un enlace directo.
export function BackButton({ fallback, size = 30 }: { fallback: string; size?: number }) {
  const router = useRouter();
  const t = useTranslations("common");

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t("back")}
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

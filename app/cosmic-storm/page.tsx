"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { StormCard } from "@/components/discover/StormCard";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import * as discoveryService from "@/services/discoveryService";
import type { SuggestionCard } from "@/services/discoveryService";

export default function CosmicStormPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [queue, setQueue] = useState<SuggestionCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);

  const loadBatch = useCallback(() => {
    discoveryService
      .fetchStormSuggestions()
      .then((res) => setQueue(res.results.filter((s) => s.action === "pending")))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? (err.body as { detail?: string })?.detail ?? `Error ${err.status} al buscar personas.`
            : "No pudimos conectar con el servidor. Intenta de nuevo.";
        setError(message);
      });
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      router.replace("/login");
      return;
    }
    if (status === "needs_onboarding") {
      router.replace("/onboarding");
      return;
    }
    loadBatch();
  }, [status, router, loadBatch]);

  const current = queue?.[0];

  const decide = async (action: "connected" | "passed") => {
    if (!current || deciding) return;
    setDeciding(true);
    try {
      await discoveryService.decideSuggestion(current.id, action);
      const rest = (queue ?? []).slice(1);
      // Storm es ilimitado (PRD §17): al vaciarse el lote pide el siguiente al backend
      setQueue(rest.length === 0 ? null : rest);
      if (rest.length === 0) loadBatch();
    } catch {
      setError("No pudimos registrar tu decisión. Intenta de nuevo.");
    } finally {
      setDeciding(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] tracking-[2px] uppercase" style={{ color: "var(--astralia-lilac)" }}>
          Descubrimiento ilimitado
        </span>
        <HeaderActions />
      </div>

      <h1
        className="mt-2.5 mb-1 text-[27px] font-semibold italic text-center"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        Cosmic Storm
      </h1>
      <p className="text-[11px] text-center mb-5" style={{ color: "var(--astralia-lilac)" }}>
        Más allá de tu rango habitual de compatibilidad
      </p>

      {error && (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs rounded-full px-4 py-2"
            style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && queue === null && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Buscando personas en el cosmos…
        </p>
      )}

      {!error && queue !== null && !current && (
        <div className="flex-grow flex items-center justify-center text-center px-6">
          <p className="text-sm" style={{ color: "var(--astralia-lilac)" }}>
            Por ahora no hay más personas por descubrir. Vuelve más tarde, a medida que se sumen nuevos perfiles.
          </p>
        </div>
      )}

      {!error && current && (
        <>
          <StormCard suggestion={current} />
          <div className="flex justify-center gap-[22px] py-5">
            <button
              type="button"
              onClick={() => decide("passed")}
              disabled={deciding}
              aria-label="Pasar"
              className="w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#EFE9F7" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => decide("connected")}
              disabled={deciding}
              aria-label="Conectar"
              className="w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D", boxShadow: "0 0 18px rgba(232,217,181,0.4)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 21s-7-4.5-9.5-9C.7 8.2 2.6 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.4 0 5.3 3.2 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
              </svg>
            </button>
          </div>
        </>
      )}

      <BottomNav active="/cosmic-storm" />
    </main>
  );
}

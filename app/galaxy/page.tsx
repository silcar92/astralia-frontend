"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { GalaxyChart } from "@/components/galaxy/GalaxyChart";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import * as galaxyService from "@/services/galaxyService";
import type { GalaxyStar } from "@/services/galaxyService";

export default function MyGalaxyPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [stars, setStars] = useState<GalaxyStar[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    galaxyService
      .fetchGalaxy()
      .then((res) => setStars(res.results))
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? (err.body as { detail?: string })?.detail ?? `Error ${err.status} al cargar tu galaxia.`
            : "No pudimos conectar con el servidor. Intenta de nuevo.";
        setError(message);
      });
  }, [status, router]);

  return (
    <main
      className="flex flex-col overflow-hidden relative"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, #3b2e5c 0%, #221a3b 45%, #171a33 100%)",
        color: "#EFE9F7",
        fontFamily: "var(--font-sans)",
        padding: "32px 22px 0 22px",
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 600, fontStyle: "italic" }}>
          Mi Galaxia
        </div>
        <HeaderActions />
      </div>

      <div className="flex-grow relative" style={{ marginTop: 6, minHeight: 420 }}>
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
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

        {!error && stars === null && (
          <p className="absolute inset-0 flex items-center justify-center text-center text-sm px-8" style={{ color: "var(--astralia-lilac)" }}>
            Cargando tu galaxia…
          </p>
        )}

        {!error && stars !== null && stars.length === 0 && (
          <p
            className="absolute inset-x-0 text-center text-sm px-8"
            style={{ color: "var(--astralia-lilac)", top: "66%" }}
          >
            Aún no tienes estrellas en tu galaxia. Conéctate con alguien en Discover o Cosmic Storm para que aparezca aquí.
          </p>
        )}

        {!error && stars !== null && <GalaxyChart stars={stars} />}
      </div>

      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 16,
          fontStyle: "italic",
          color: "#D9C9F0",
          textAlign: "center",
          padding: "10px 20px 0 20px",
        }}
      >
        El tamaño de tu galaxia no define tu valor personal.
      </div>

      <BottomNav active="/galaxy" />
    </main>
  );
}

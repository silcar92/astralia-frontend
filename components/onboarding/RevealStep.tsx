"use client";

import { useEffect, useState } from "react";

import { PlacementsRow } from "@/components/astrology/PlacementsRow";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as astrologyService from "@/services/astrologyService";
import type { NatalChart } from "@/services/astrologyService";
import type { PersonalityResult } from "@/services/personalityService";

export function RevealStep({ result, onEnter }: { result: PersonalityResult; onEnter: () => void }) {
  const [chart, setChart] = useState<NatalChart | null>(null);

  useEffect(() => {
    astrologyService.fetchMyNatalChart().then(setChart).catch(() => setChart(null));
  }, []);

  const sun = chart ? astrologyService.findPlacement(chart, "sun") : undefined;
  const moon = chart ? astrologyService.findPlacement(chart, "moon") : undefined;
  const ascendant = chart ? astrologyService.findPlacement(chart, "ascendant") : undefined;

  return (
    <div className="w-full max-w-sm text-center">
      <p className="text-xs tracking-widest uppercase" style={{ color: "var(--astralia-lilac)" }}>
        Paso 4 de 4
      </p>
      <h1 className="mt-2 text-2xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
        Tu perfil cósmico está listo
      </h1>

      <GlassCard className="mt-6 flex flex-col items-center gap-4">
        <span
          className="text-lg italic font-semibold"
          style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-gold)" }}
        >
          {result.cosmic_name}
        </span>

        <PlacementsRow sun={sun?.sign} moon={moon?.sign} ascendant={ascendant?.sign} />

        <p className="text-xs" style={{ color: "var(--astralia-text)" }}>
          La astrología en Astralia es un marco de autoconocimiento y compatibilidad — no una predicción científica
          ni determinista.
        </p>
      </GlassCard>

      <GoldButton type="button" onClick={onEnter} className="mt-6 w-full">
        Entrar a Astralia
      </GoldButton>
    </div>
  );
}

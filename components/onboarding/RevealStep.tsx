"use client";

import { useEffect, useState } from "react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as astrologyService from "@/services/astrologyService";
import type { NatalChart } from "@/services/astrologyService";
import type { PersonalityResult } from "@/services/personalityService";

const SIGN_LABELS: Record<string, string> = {
  aries: "Aries", taurus: "Tauro", gemini: "Géminis", cancer: "Cáncer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", scorpio: "Escorpio", sagittarius: "Sagitario", capricorn: "Capricornio",
  aquarius: "Acuario", pisces: "Piscis",
};

// Glifos genéricos (no dependen del signo) -- la constelación dibujada por signo, como en Discover/Perfil,
// queda pendiente de construir para los 12 signos (hoy solo existen 3 de ejemplo en el mockup).
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <g stroke="#F3E9C8" strokeWidth="1.4">
        <line x1="12" y1="1.5" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22.5" y2="12" />
      </g>
      <circle cx="12" cy="12" r="5" fill="none" stroke="#F3E9C8" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.3" fill="#F3E9C8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm4 2.7a8 8 0 100 14.6 8 8 0 000-14.6z"
        fill="#F3E9C8"
      />
    </svg>
  );
}

function AscendantIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <line x1="4" y1="18" x2="20" y2="18" stroke="#F3E9C8" strokeWidth="1.4" />
      <path
        d="M12 16V6M7 11l5-5 5 5"
        fill="none"
        stroke="#F3E9C8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

        <div className="flex justify-between gap-6 w-full">
          <div className="flex flex-1 flex-col items-center gap-1">
            <SunIcon />
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--astralia-lilac-soft)" }}>
              Sol · {sun ? SIGN_LABELS[sun.sign] : "—"}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <MoonIcon />
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--astralia-lilac-soft)" }}>
              Luna · {moon ? SIGN_LABELS[moon.sign] : "—"}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <AscendantIcon />
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--astralia-lilac-soft)" }}>
              Asc. · {ascendant ? SIGN_LABELS[ascendant.sign] : "—"}
            </span>
          </div>
        </div>

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

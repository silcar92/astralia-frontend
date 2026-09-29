"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { PlacementsRow } from "@/components/astrology/PlacementsRow";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import * as astrologyService from "@/services/astrologyService";
import type { NatalChart } from "@/services/astrologyService";
import type { PersonalityResult } from "@/services/personalityService";

export function RevealStep({ result, onEnter }: { result: PersonalityResult; onEnter: () => void }) {
  const t = useTranslations("onboarding.reveal");
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
        {t("step")}
      </p>
      <h1 className="mt-2 text-2xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
        {t("title")}
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
          {t("disclaimer")}
        </p>
      </GlassCard>

      <GoldButton type="button" onClick={onEnter} className="mt-6 w-full">
        {t("enter")}
      </GoldButton>
    </div>
  );
}

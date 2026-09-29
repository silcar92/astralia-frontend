"use client";

import { useTranslations } from "next-intl";

import { AscendantGlyph, MoonGlyph, SunGlyph } from "@/components/astrology/glyphs";
import { Constellation } from "@/components/astrology/Constellation";
import { useCatalog } from "@/hooks/useCatalog";

function Column({ glyph, label, sign, compact }: { glyph: React.ReactNode; label: string; sign?: string; compact: boolean }) {
  const catalog = useCatalog();

  return (
    <div className="flex-1 flex flex-col items-center">
      {glyph}
      {sign && <Constellation sign={sign} height={compact ? 26 : 34} />}
      <div className="text-[8px] tracking-[0.5px] uppercase mt-1 text-center" style={{ color: "#D9C9F0" }}>
        {label} · {sign ? catalog.sign(sign) : "—"}
      </div>
    </div>
  );
}

export function PlacementsRow({
  sun,
  moon,
  ascendant,
  compact = false,
}: {
  sun?: string;
  moon?: string;
  ascendant?: string;
  compact?: boolean;
}) {
  const t = useTranslations("catalog");
  const catalog = useCatalog();

  if (!sun && !moon && !ascendant) {
    return (
      <p className="text-[11px] leading-[1.5] text-center px-3" style={{ color: "#B9A8DE" }}>
        {t("noChart")}
      </p>
    );
  }

  return (
    <div className="flex justify-between gap-1.5 w-full">
      <Column glyph={<SunGlyph />} label={catalog.body("sun")} sign={sun} compact={compact} />
      <Column glyph={<MoonGlyph />} label={catalog.body("moon")} sign={moon} compact={compact} />
      <Column glyph={<AscendantGlyph />} label={catalog.body("ascendant")} sign={ascendant} compact={compact} />
    </div>
  );
}

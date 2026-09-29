import { AscendantGlyph, MoonGlyph, SIGN_LABELS, SunGlyph } from "@/components/astrology/glyphs";
import { Constellation } from "@/components/astrology/Constellation";

function Column({ glyph, label, sign, compact }: { glyph: React.ReactNode; label: string; sign?: string; compact: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      {glyph}
      {sign && <Constellation sign={sign} height={compact ? 26 : 34} />}
      <div className="text-[8px] tracking-[0.5px] uppercase mt-1 text-center" style={{ color: "#D9C9F0" }}>
        {label} · {sign ? SIGN_LABELS[sign] ?? sign : "—"}
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
  if (!sun && !moon && !ascendant) {
    return (
      <p className="text-[11px] leading-[1.5] text-center px-3" style={{ color: "#B9A8DE" }}>
        La carta natal todavía no está disponible.
      </p>
    );
  }

  return (
    <div className="flex justify-between gap-1.5 w-full">
      <Column glyph={<SunGlyph />} label="Sol" sign={sun} compact={compact} />
      <Column glyph={<MoonGlyph />} label="Luna" sign={moon} compact={compact} />
      <Column glyph={<AscendantGlyph />} label="Asc." sign={ascendant} compact={compact} />
    </div>
  );
}

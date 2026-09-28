import { GoldButton } from "@/components/ui/GoldButton";
import type { SuggestionCard as SuggestionCardType } from "@/services/discoveryService";

const SIGN_LABELS: Record<string, string> = {
  aries: "Aries", taurus: "Tauro", gemini: "Géminis", cancer: "Cáncer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", scorpio: "Escorpio", sagittarius: "Sagitario", capricorn: "Capricornio",
  aquarius: "Acuario", pisces: "Piscis",
};

export function SuggestionCard({
  suggestion,
  onConnect,
  onPass,
  loading,
}: {
  suggestion: SuggestionCardType;
  onConnect: () => void;
  onPass: () => void;
  loading: boolean;
}) {
  const score = Math.round(parseFloat(suggestion.compatibility_score));
  const moonSign = suggestion.chart_highlights.moon ? SIGN_LABELS[suggestion.chart_highlights.moon] : null;
  const ascSign = suggestion.chart_highlights.ascendant ? SIGN_LABELS[suggestion.chart_highlights.ascendant] : null;

  return (
    <div
      className="flex-grow rounded-3xl p-[22px] backdrop-blur-md flex flex-col items-center text-center"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.35)" }}
    >
      <div
        className="w-[88px] h-[88px] rounded-full flex items-center justify-center"
        style={{
          background: "#2C2249",
          border: "2px solid #E8D9B5",
          color: "#E8D9B5",
          boxShadow: "0 0 24px rgba(232,217,181,0.35)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>

      <div className="mt-3 text-[22px] font-semibold italic" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
        {suggestion.name}, {suggestion.age}
      </div>
      <div className="mt-0.5 text-xs" style={{ color: "var(--astralia-lilac)" }}>
        {suggestion.city}, {suggestion.country}
      </div>
      {(moonSign || ascSign) && (
        <div className="mt-2.5 text-[11px]" style={{ color: "var(--astralia-lilac-soft)" }}>
          {[moonSign && `Luna en ${moonSign}`, ascSign && `Asc. ${ascSign}`].filter(Boolean).join(" · ")}
        </div>
      )}

      <div className="my-5 relative w-[110px] h-[110px] flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,217,181,0.25) 0%, rgba(232,217,181,0) 70%)" }}
        />
        <div
          className="relative w-[90px] h-[90px] rounded-full flex flex-col items-center justify-center"
          style={{ border: "3px solid #E8D9B5" }}
        >
          <span className="text-[28px] font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
            {score}%
          </span>
          <span className="text-[9px] tracking-wide uppercase" style={{ color: "var(--astralia-lilac-soft)" }}>
            afinidad
          </span>
        </div>
      </div>

      <p className="text-[13px] px-2" style={{ color: "var(--astralia-text)" }}>
        {suggestion.explanation}
      </p>

      {suggestion.shared_interests.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap mt-5 mb-5">
          {suggestion.shared_interests.map((interest) => (
            <span
              key={interest}
              className="text-[11px] rounded-full px-3.5 py-1.5"
              style={{ background: "rgba(232,217,181,0.18)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2.5 mt-auto w-full pt-4">
        <button
          type="button"
          onClick={onPass}
          disabled={loading}
          aria-label="Pasar"
          className="w-[52px] rounded-full flex items-center justify-center disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", color: "var(--astralia-text)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        <GoldButton type="button" onClick={onConnect} disabled={loading} className="flex-1">
          Conectar
        </GoldButton>
      </div>
    </div>
  );
}

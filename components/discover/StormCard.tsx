import { PlacementsRow } from "@/components/astrology/PlacementsRow";
import type { SuggestionCard } from "@/services/discoveryService";

function distanceLabel(km: number | null): string | null {
  if (km === null) return null;
  return km === 0 ? "en tu zona" : `a ${km} km`;
}

export function StormCard({ suggestion }: { suggestion: SuggestionCard }) {
  const score = Math.round(parseFloat(suggestion.compatibility_score));
  const distance = distanceLabel(suggestion.distance_km);

  return (
    <div className="flex-grow relative">
      <div
        className="absolute rounded-3xl"
        style={{
          inset: "16px 8px 0 8px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(232,217,181,0.18)",
          transform: "rotate(-3deg)",
        }}
      />
      <div
        className="absolute inset-0 rounded-3xl p-[22px] flex flex-col items-center text-center backdrop-blur-md overflow-y-auto"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.35)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "#2C2249", border: "2px solid #E8D9B5", color: "#E8D9B5", boxShadow: "0 0 22px rgba(232,217,181,0.3)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>

        <div className="text-[21px] font-semibold mt-3" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
          {suggestion.name}, {suggestion.age}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#B9A8DE" }}>
          {suggestion.city}
          {distance ? ` · ${distance}` : ""}
        </div>

        <div className="mt-3 w-full">
          <PlacementsRow
            sun={suggestion.chart_highlights.sun}
            moon={suggestion.chart_highlights.moon}
            ascendant={suggestion.chart_highlights.ascendant}
            compact
          />
        </div>

        <div
          className="flex items-center gap-1.5 mt-3.5 rounded-full px-3.5 py-[5px]"
          style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.35)" }}
        >
          <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
            {score}%
          </span>
          <span className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#D9C9F0" }}>
            afinidad
          </span>
        </div>

        <p className="text-[13px] leading-[1.6] mt-4" style={{ color: "#EFE9F7" }}>
          {suggestion.explanation}
        </p>

        {suggestion.shared_interests.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap mt-4">
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
      </div>
    </div>
  );
}

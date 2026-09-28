export const SIGN_LABELS: Record<string, string> = {
  aries: "Aries", taurus: "Tauro", gemini: "Géminis", cancer: "Cáncer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", scorpio: "Escorpio", sagittarius: "Sagitario", capricorn: "Capricornio",
  aquarius: "Acuario", pisces: "Piscis",
};

export function SunGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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

export function MoonGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm4 2.7a8 8 0 100 14.6 8 8 0 000-14.6z"
        fill="#F3E9C8"
      />
    </svg>
  );
}

export function AscendantGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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

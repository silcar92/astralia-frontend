type Star = [x: number, y: number, r: number];
type ConstellationDef = { lines: string[]; stars: Star[] };

// viewBox 100x46. Leo, Cáncer y Libra son las del mockup aprobado (ProfileV2); el resto son trazos estilizados
// inspirados en la forma de cada constelación, no cartografía astronómica exacta.
const CONSTELLATIONS: Record<string, ConstellationDef> = {
  leo: {
    lines: ["M14 40L18 24", "M18 24L30 10", "M30 10L46 4", "M46 4L60 8", "M30 10L32 28", "M32 28L66 26", "M66 26L88 16"],
    stars: [[14, 40, 3], [18, 24, 1.8], [30, 10, 2.1], [46, 4, 1.7], [60, 8, 1.5], [32, 28, 1.6], [66, 26, 1.8], [88, 16, 2.3]],
  },
  cancer: {
    lines: ["M12 36L28 20", "M28 20L48 10", "M48 10L68 22", "M28 20L34 40"],
    stars: [[12, 36, 1.8], [28, 20, 2.4], [48, 10, 1.8], [68, 22, 2], [34, 40, 1.5]],
  },
  libra: {
    lines: ["M10 30L34 8L72 12L50 38Z"],
    stars: [[10, 30, 2], [34, 8, 2.2], [72, 12, 1.8], [50, 38, 2]],
  },
  aries: {
    lines: ["M10 36L34 24", "M34 24L62 16", "M62 16L84 20"],
    stars: [[10, 36, 1.6], [34, 24, 2], [62, 16, 2.4], [84, 20, 1.8]],
  },
  taurus: {
    lines: ["M18 8L34 24", "M34 24L50 30", "M50 30L68 22", "M68 22L84 8", "M50 30L58 42"],
    stars: [[18, 8, 1.6], [34, 24, 1.8], [50, 30, 2.5], [68, 22, 1.8], [84, 8, 1.6], [58, 42, 1.5]],
  },
  gemini: {
    lines: ["M22 6L26 22", "M26 22L30 40", "M44 6L48 22", "M48 22L52 40", "M26 22L48 22", "M22 6L44 6"],
    stars: [[22, 6, 2.2], [26, 22, 1.7], [30, 40, 1.6], [44, 6, 2.2], [48, 22, 1.7], [52, 40, 1.6]],
  },
  virgo: {
    lines: ["M10 14L28 20", "M28 20L46 24", "M46 24L64 18", "M64 18L84 8", "M46 24L52 38", "M52 38L70 42", "M28 20L24 34"],
    stars: [[10, 14, 1.6], [28, 20, 1.8], [46, 24, 2.4], [64, 18, 1.7], [84, 8, 1.8], [52, 38, 1.6], [70, 42, 1.6], [24, 34, 1.5]],
  },
  scorpio: {
    lines: ["M10 8L20 14", "M20 14L28 24", "M28 24L40 30", "M40 30L54 28", "M54 28L66 34", "M66 34L78 42", "M78 42L90 36", "M20 14L12 22"],
    stars: [[10, 8, 1.6], [20, 14, 1.8], [28, 24, 2.5], [40, 30, 1.7], [54, 28, 1.7], [66, 34, 1.7], [78, 42, 1.8], [90, 36, 1.7], [12, 22, 1.5]],
  },
  sagittarius: {
    lines: ["M20 32L30 18", "M30 18L46 14", "M46 14L58 22", "M58 22L50 36", "M50 36L36 40", "M36 40L20 32", "M46 14L74 8", "M58 22L80 30"],
    stars: [[20, 32, 1.6], [30, 18, 1.8], [46, 14, 2.2], [58, 22, 1.9], [50, 36, 1.8], [36, 40, 1.6], [74, 8, 1.7], [80, 30, 1.7]],
  },
  capricorn: {
    lines: ["M10 12L32 10", "M32 10L62 30", "M62 30L86 26", "M86 26L62 42", "M62 42L34 30", "M34 30L10 12"],
    stars: [[10, 12, 1.7], [32, 10, 1.9], [62, 30, 2.2], [86, 26, 1.7], [62, 42, 1.7], [34, 30, 1.6]],
  },
  aquarius: {
    lines: ["M10 16L26 10", "M26 10L40 18", "M40 18L56 12", "M56 12L72 20", "M72 20L88 14", "M40 18L44 34", "M44 34L60 40"],
    stars: [[10, 16, 1.6], [26, 10, 1.8], [40, 18, 2.3], [56, 12, 1.7], [72, 20, 1.8], [88, 14, 1.6], [44, 34, 1.6], [60, 40, 1.6]],
  },
  pisces: {
    lines: ["M10 10L24 18", "M24 18L38 34", "M38 34L58 36", "M58 36L74 24", "M74 24L90 14", "M74 24L80 38"],
    stars: [[10, 10, 1.7], [24, 18, 1.7], [38, 34, 2], [58, 36, 1.8], [74, 24, 2.2], [90, 14, 1.7], [80, 38, 1.5]],
  },
};

export function Constellation({ sign, height = 34 }: { sign: string; height?: number }) {
  const def = CONSTELLATIONS[sign];
  if (!def) return null;

  return (
    <svg width="100%" height={height} viewBox="0 0 100 46" style={{ marginTop: 3, opacity: 0.85 }} aria-hidden="true">
      <g stroke="#E8D9B5" strokeWidth="1" strokeOpacity="0.55" fill="none">
        {def.lines.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="#F3E9C8">
        {def.stars.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

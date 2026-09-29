"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import type { GalaxyStar } from "@/services/galaxyService";

const CENTER = { x: 175, y: 270 };
const MIN_RADIUS = 55;
const MAX_RADIUS = 155;
const GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

const GOLD = "#E8D9B5";
const LILAC = "#C9A6D6";
const MUTED = "#8E7FB0";

function starColor(brightness: number): string {
  if (brightness >= 0.66) return GOLD;
  if (brightness >= 0.33) return LILAC;
  return MUTED;
}

function starScale(size: string | null): number {
  const score = size ? parseFloat(size) : 0;
  return 3 + (Math.min(Math.max(score, 0), 100) / 100) * 7;
}

function layout(stars: GalaxyStar[]) {
  const n = stars.length;
  return stars.map((star, i) => {
    const radius = n === 1 ? MIN_RADIUS : MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt((i + 1) / n);
    const angle = i * GOLDEN_ANGLE;
    return {
      star,
      x: CENTER.x + radius * Math.cos(angle),
      y: CENTER.y + radius * Math.sin(angle),
      scale: starScale(star.size),
      brightness: Math.max(star.brightness, 0.5),
    };
  });
}

export function GalaxyChart({ stars }: { stars: GalaxyStar[] }) {
  const router = useRouter();
  const t = useTranslations("galaxy");
  const placed = layout(stars);

  return (
    <svg width="100%" height="100%" viewBox="0 0 350 520" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <polygon
          id="star5"
          points="0,-1 0.247,-0.34 0.951,-0.309 0.399,0.13 0.588,0.809 0,0.42 -0.588,0.809 -0.399,0.13 -0.951,-0.309 -0.247,-0.34"
        />
      </defs>

      <g stroke="#8E7FB0" strokeWidth="1" strokeDasharray="2 5" fill="none" opacity="0.28">
        <circle cx={CENTER.x} cy={CENTER.y} r="95" />
        <circle cx={CENTER.x} cy={CENTER.y} r="165" />
        <circle cx={CENTER.x} cy={CENTER.y} r="235" />
      </g>

      <g fill="#F3E9C8" opacity="0.7">
        <circle cx="150" cy="55" r="1.4" />
        <circle cx="255" cy="40" r="1.6" />
        <circle cx="40" cy="90" r="1.3" />
        <circle cx="330" cy="130" r="1.5" />
        <circle cx="20" cy="230" r="1.4" />
        <circle cx="345" cy="240" r="1.3" />
        <circle cx="70" cy="460" r="1.5" />
        <circle cx="310" cy="470" r="1.3" />
        <circle cx="190" cy="490" r="1.5" />
      </g>

      <g>
        {placed.map(({ star, x, y, scale, brightness }) => (
          <g
            key={star.id}
            role="link"
            tabIndex={0}
            aria-label={t("viewProfileOf", { name: star.name })}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/people/${star.other_user_id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") router.push(`/people/${star.other_user_id}`);
            }}
          >
            <circle cx={x} cy={y} r={Math.max(scale + 6, 16)} fill="transparent" />
            <use
              href="#star5"
              fill={starColor(brightness)}
              opacity={brightness}
              transform={`translate(${x},${y}) scale(${scale})`}
            />
            {star.sparkle && (
              <path
                d={`M${x} ${y - scale - 4} L${x + 1.5} ${y - scale} L${x + 4} ${y - scale + 1.5} L${x + 1.5} ${y - scale + 3} L${x} ${y - scale + 5} L${x - 1.5} ${y - scale + 3} L${x - 4} ${y - scale + 1.5} L${x - 1.5} ${y - scale} Z`}
                fill="#F3E9C8"
              />
            )}
            <text
              x={x}
              y={y + scale + 12}
              textAnchor="middle"
              fontFamily="Nunito Sans"
              fontSize="11"
              fill="#D9C9F0"
            >
              {star.name}
            </text>
          </g>
        ))}
      </g>

      <g
        role="link"
        tabIndex={0}
        aria-label={t("viewMine")}
        style={{ cursor: "pointer" }}
        onClick={() => router.push("/profile")}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push("/profile");
        }}
      >
        <circle cx={CENTER.x} cy={CENTER.y} r="26" fill="transparent" />
        <circle cx={CENTER.x} cy={CENTER.y} r="20" fill={GOLD} opacity="0.18" />
        <use href="#star5" fill={GOLD} stroke="#F3E9C8" strokeWidth="0.4" transform={`translate(${CENTER.x},${CENTER.y}) scale(13)`} />
        <text x={CENTER.x} y={CENTER.y + 30} textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="14" fontWeight="600" fill="#F3E9C8">
          {t("you")}
        </text>
      </g>
    </svg>
  );
}

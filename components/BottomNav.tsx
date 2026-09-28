"use client";

import Link from "next/link";

function CosmosIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z" />
    </svg>
  );
}

function StormIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3L5 13h5l-1 8 8-11h-5z" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.6-2.8 2.7-4.5 5.5-4.5s4.9 1.7 5.5 4.5" />
      <circle cx="17" cy="8.5" r="2.3" />
      <path d="M15.3 14.6c2.1.3 3.6 1.8 4.2 4.4" />
    </svg>
  );
}

function GalaxyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1-2.1 6.4-2.1-6.4-6.4-2.1 6.4-2.1z" />
    </svg>
  );
}

const ITEMS = [
  { href: "/cosmos", label: "COSMOS", Icon: CosmosIcon },
  { href: "/discover", label: "DISCOVER", Icon: DiscoverIcon },
  { href: "/cosmic-storm", label: "STORM", Icon: StormIcon },
  { href: "/communities", label: "COMUNIDAD", Icon: CommunityIcon },
  { href: "/galaxy", label: "GALAXIA", Icon: GalaxyIcon },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <div className="flex justify-around pt-4 pb-5 mt-auto">
      {ITEMS.map(({ href, label, Icon }) => {
        const isActive = href === active;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1"
            style={{ color: isActive ? "#F3E9C8" : "#8E7FB0" }}
          >
            <Icon />
            <span className="text-[9px] tracking-wide">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

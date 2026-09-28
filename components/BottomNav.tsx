"use client";

import Link from "next/link";

const ITEMS = [
  { href: "/cosmos", label: "COSMOS" },
  { href: "/discover", label: "DISCOVER" },
  { href: "/cosmic-storm", label: "STORM" },
  { href: "/communities", label: "COMUNIDAD" },
  { href: "/galaxy", label: "GALAXIA" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <div className="flex justify-around pt-4 pb-5 mt-auto">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-[9px] tracking-wide"
          style={{ color: item.href === active ? "#F3E9C8" : "#8E7FB0" }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

const BANNERS = [
  {
    background: "linear-gradient(135deg,#5B4E85,#2C2249)",
    color: "#8E7FB0",
    icon: <path d="M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6L12 15l-5 3.2 1.4-5.6L4 8.8l5.8-.5z" />,
    stroke: "1",
  },
  {
    background: "linear-gradient(135deg,#8E7FB0,#3B2E5C)",
    color: "#D9C9F0",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 16l-5-5-5 5-3-3-5 5" />
      </>
    ),
    stroke: "1",
  },
  {
    background: "linear-gradient(135deg,#C9A6D6,#5B4E85)",
    color: "#F3E9C8",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z" />
      </>
    ),
    stroke: "1.2",
  },
];

export function CommunityBanner({ id, height = 76 }: { id: number; height?: number }) {
  const banner = BANNERS[id % BANNERS.length];
  return (
    <div className="flex items-center justify-center" style={{ height, background: banner.background, color: banner.color }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={banner.stroke} aria-hidden="true">
        {banner.icon}
      </svg>
    </div>
  );
}

export function memberLabel(count: number, visibility: "public" | "private"): string {
  const members = `${new Intl.NumberFormat("es").format(count)} ${count === 1 ? "miembro" : "miembros"}`;
  return `${members} · ${visibility === "public" ? "Pública" : "Privada"}`;
}

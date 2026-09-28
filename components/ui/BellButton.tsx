import Link from "next/link";

export function BellButton({ hasAlert = false }: { hasAlert?: boolean }) {
  return (
    <Link
      href="/notifications"
      aria-label="Notificaciones"
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center relative"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(232,217,181,0.35)", color: "#E8D9B5" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
      </svg>
      {hasAlert && (
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--astralia-alert)", border: "1.5px solid #221A3B" }}
        />
      )}
    </Link>
  );
}

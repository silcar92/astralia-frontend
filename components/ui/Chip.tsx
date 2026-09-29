export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-full px-4 py-2 text-xs transition-colors"
      style={
        selected
          ? { background: "rgba(232,217,181,0.18)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }
          : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--astralia-lilac)" }
      }
    >
      {children}
    </button>
  );
}

import type { AstraliaEvent } from "@/services/eventService";

const CHIP = "px-4 py-2 rounded-full text-[11px] font-bold";

export function RsvpButton({ event, busy, onRsvp }: { event: AstraliaEvent; busy: boolean; onRsvp: () => void }) {
  if (event.is_organizer) {
    return (
      <span className={CHIP} style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}>
        Organizas
      </span>
    );
  }
  if (event.my_status === "going") {
    return (
      <span className={CHIP} style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}>
        Confirmado
      </span>
    );
  }
  if (event.my_status === "waitlisted") {
    return (
      <span className={CHIP} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "#B9A8DE" }}>
        En espera
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onRsvp}
      disabled={busy}
      className={`${CHIP} disabled:opacity-60`}
      style={
        event.is_full
          ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#EFE9F7" }
          : { background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }
      }
    >
      {event.is_full ? "Lista de espera" : "Asistiré"}
    </button>
  );
}

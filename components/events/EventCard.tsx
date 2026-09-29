import Link from "next/link";

import { RsvpButton } from "@/components/events/RsvpButton";
import { attendeeLabel, eventDateParts } from "@/lib/events";
import type { AstraliaEvent } from "@/services/eventService";

export function EventCard({ event, busy, onRsvp }: { event: AstraliaEvent; busy: boolean; onRsvp: () => void }) {
  const { month, day } = eventDateParts(event.starts_at);
  const time = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.starts_at));

  return (
    <div
      className="relative rounded-[20px] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)" }}
    >
      <Link href={`/events/${event.id}`} aria-label={`Abrir ${event.title}`} className="flex gap-3.5 p-3.5 pb-[58px]">
        <div
          className="w-[54px] shrink-0 rounded-2xl flex flex-col items-center justify-center py-2"
          style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.35)" }}
        >
          <span className="text-[9px] tracking-[1px]" style={{ color: "#B9A8DE" }}>
            {month}
          </span>
          <span className="text-[22px] font-semibold leading-none mt-0.5" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
            {day}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{event.title}</div>
          <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
            {time} · {event.format === "online" ? "En línea" : "Presencial"}
            {event.community_name ? ` · ${event.community_name}` : ""}
          </div>
          <div className="text-[11px] mt-1" style={{ color: "#D9C9F0" }}>
            {attendeeLabel(event)}
            {event.requires_verification ? " · Requiere verificación" : ""}
          </div>
        </div>
      </Link>
      <div className="absolute right-3.5 bottom-3.5">
        <RsvpButton event={event} busy={busy} onRsvp={onRsvp} />
      </div>
    </div>
  );
}

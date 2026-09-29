import type { AstraliaEvent } from "@/services/eventService";

export function eventDateParts(iso: string): { month: string; day: string } {
  const date = new Date(iso);
  return {
    month: new Intl.DateTimeFormat("es", { month: "short" }).format(date).replace(".", "").toUpperCase(),
    day: String(date.getDate()),
  };
}

export function eventWhen(event: Pick<AstraliaEvent, "starts_at" | "ends_at">): string {
  const start = new Date(event.starts_at);
  const day = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(start);
  const time = new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" });
  const range = event.ends_at ? `${time.format(start)} – ${time.format(new Date(event.ends_at))}` : time.format(start);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${range}`;
}

export function attendeeLabel(event: Pick<AstraliaEvent, "going_count" | "capacity">): string {
  const going = `${event.going_count} ${event.going_count === 1 ? "confirmado" : "confirmados"}`;
  return event.capacity ? `${going} de ${event.capacity}` : going;
}

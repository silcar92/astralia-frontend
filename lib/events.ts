"use client";

import { useTranslations } from "next-intl";

import type { AstraliaEvent } from "@/services/eventService";

export function eventDateParts(iso: string, locale: string): { month: string; day: string } {
  const date = new Date(iso);
  return {
    month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "").toUpperCase(),
    day: String(date.getDate()),
  };
}

export function eventWhen(event: Pick<AstraliaEvent, "starts_at" | "ends_at">, locale: string): string {
  const start = new Date(event.starts_at);
  const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(start);
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const range = event.ends_at ? `${time.format(start)} – ${time.format(new Date(event.ends_at))}` : time.format(start);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${range}`;
}

// "12 confirmados de 30"
export function useAttendeeLabel() {
  const t = useTranslations("events");
  return (event: Pick<AstraliaEvent, "going_count" | "capacity">): string => {
    const going = t("attendees", { count: event.going_count });
    return event.capacity ? t("attendeesOf", { going, capacity: event.capacity }) : going;
  };
}


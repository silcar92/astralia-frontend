"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { RsvpButton } from "@/components/events/RsvpButton";
import { attendeeLabel, eventDateParts, eventWhen } from "@/lib/events";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import * as eventService from "@/services/eventService";
import type { AstraliaEvent } from "@/services/eventService";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] tracking-[1px] uppercase" style={{ color: "#B9A8DE" }}>
        {label}
      </span>
      <span className="text-[13px]" style={{ color: "#EFE9F7" }}>
        {children}
      </span>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);
  const router = useRouter();
  const { status } = useAuth();
  const [event, setEvent] = useState<AstraliaEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      router.replace("/login");
      return;
    }
    if (status === "needs_onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (!Number.isFinite(eventId)) return;

    eventService
      .fetchEvent(eventId)
      .then(setEvent)
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 404
            ? "Este evento no existe o no está disponible para ti."
            : "No pudimos cargar el evento. Intenta de nuevo."
        );
      });
  }, [status, router, eventId]);

  const reload = () => eventService.fetchEvent(eventId).then(setEvent).catch(() => {});

  const handleRsvp = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await eventService.rsvp(eventId);
      await reload();
    } catch (err) {
      setNotice(err instanceof ApiError ? (err.body as { detail?: string })?.detail ?? "No pudimos registrar tu asistencia." : "No pudimos registrar tu asistencia.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelRsvp = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await eventService.cancelRsvp(eventId);
      await reload();
    } catch {
      setNotice("No pudimos cancelar tu asistencia. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!event || !window.confirm(`¿Cancelar "${event.title}"? Se avisará a quienes se habían anotado.`)) return;
    setBusy(true);
    try {
      await eventService.cancelEvent(eventId);
      router.replace("/events");
    } catch {
      setNotice("No pudimos cancelar el evento. Intenta de nuevo.");
      setBusy(false);
    }
  };

  const { month, day } = event ? eventDateParts(event.starts_at) : { month: "", day: "" };
  const attending = event?.my_status === "going" || event?.my_status === "waitlisted";

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          aria-label="Volver a eventos"
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          Evento
        </span>
      </div>

      {error && (
        <p className="text-center text-sm mt-10 px-6" style={{ color: "var(--astralia-lilac)" }}>
          {error}
        </p>
      )}
      {!error && !event && (
        <p className="text-center text-sm mt-10" style={{ color: "var(--astralia-lilac)" }}>
          Cargando evento…
        </p>
      )}

      {event && (
        <>
          <div className="flex gap-3.5 items-center mt-6">
            <div
              className="w-[60px] shrink-0 rounded-2xl flex flex-col items-center justify-center py-2.5"
              style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.35)" }}
            >
              <span className="text-[10px] tracking-[1px]" style={{ color: "#B9A8DE" }}>
                {month}
              </span>
              <span className="text-[26px] font-semibold leading-none mt-0.5" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
                {day}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold italic leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
              {event.title}
            </h1>
          </div>

          <div
            className="mt-5 rounded-[20px] p-4 flex flex-col gap-3.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,217,181,0.3)" }}
          >
            <Row label="Cuándo">{eventWhen(event)}</Row>
            <Row label={event.format === "online" ? "Dónde · en línea" : "Dónde · presencial"}>
              {event.location ||
                (event.format === "in_person"
                  ? "La dirección se revela cuando confirmes tu asistencia."
                  : "El enlace se comparte con quienes confirmen.")}
            </Row>
            <Row label="Organiza">
              {event.organizer_name}
              {event.community_name ? ` · ${event.community_name}` : ""}
            </Row>
            <Row label="Asistentes">
              {attendeeLabel(event)}
              {event.is_full ? " · Cupo lleno, hay lista de espera" : ""}
            </Row>
          </div>

          {event.description && (
            <p className="text-[13px] leading-[1.6] mt-5 whitespace-pre-wrap break-words" style={{ color: "#EFE9F7" }}>
              {event.description}
            </p>
          )}

          {event.format === "in_person" && (
            <p
              className="text-[11px] leading-[1.5] mt-5 rounded-2xl p-3.5"
              style={{ background: "rgba(232,217,181,0.08)", border: "1px solid rgba(232,217,181,0.25)", color: "#D9C9F0" }}
            >
              Seguridad: reúnete en un lugar público, avisa a alguien de confianza a dónde vas y reporta cualquier conducta que te incomode.
              {event.requires_verification ? " Este evento solo admite personas con identidad verificada." : ""}
            </p>
          )}

          {notice && (
            <p className="text-xs mt-4 text-center" style={{ color: "var(--astralia-alert)" }} role="alert">
              {notice}
            </p>
          )}

          <div className="flex flex-col items-center gap-3 mt-6">
            <RsvpButton event={event} busy={busy} onRsvp={handleRsvp} />
            {attending && !event.is_organizer && (
              <button type="button" onClick={handleCancelRsvp} disabled={busy} className="text-[11px] underline underline-offset-2" style={{ color: "#8E7FB0" }}>
                Cancelar mi asistencia
              </button>
            )}
            {event.is_organizer && (
              <button type="button" onClick={handleCancelEvent} disabled={busy} className="text-[11px] underline underline-offset-2" style={{ color: "var(--astralia-alert)" }}>
                Cancelar el evento
              </button>
            )}
          </div>
        </>
      )}

      <BottomNav active="/communities" />
    </main>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { BottomNav } from "@/components/BottomNav";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import * as eventService from "@/services/eventService";

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function NewEventForm() {
  const router = useRouter();
  const communityParam = useSearchParams().get("community");
  const communityId = communityParam && /^\d+$/.test(communityParam) ? Number(communityParam) : undefined;
  const { status, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"online" | "in_person">("online");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") router.replace("/login");
    else if (status === "needs_onboarding") router.replace("/onboarding");
  }, [status, router]);

  const needsVerification = format === "in_person" && profile?.verification_status !== "approved";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const created = await eventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        format,
        location: location.trim(),
        starts_at: new Date(startsAt).toISOString(),
        ...(endsAt ? { ends_at: new Date(endsAt).toISOString() } : {}),
        ...(capacity ? { capacity: Number(capacity) } : {}),
        ...(communityId ? { community: communityId } : {}),
      });
      router.replace(`/events/${created.id}`);
    } catch (err) {
      let message = "No pudimos crear el evento. Intenta de nuevo.";
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as Record<string, unknown>;
        const first = typeof body.detail === "string" ? body.detail : Object.values(body).flat()[0];
        if (typeof first === "string") message = first;
      }
      setError(message);
      setSaving(false);
    }
  };

  const minStart = toLocalInput(new Date());

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-8 pb-4" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center gap-3">
        <Link
          href={communityId ? `/communities/${communityId}` : "/events"}
          aria-label="Volver"
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="text-[18px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          {communityId ? "Evento de la comunidad" : "Organizar un evento"}
        </span>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4 mt-6">
        <TextField label="Título" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs tracking-wide uppercase" style={{ color: "var(--astralia-lilac)" }}>
            Descripción
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
          />
        </label>

        <fieldset>
          <legend className="text-xs tracking-wide uppercase mb-1.5" style={{ color: "var(--astralia-lilac)" }}>
            Formato
          </legend>
          <div className="flex gap-2">
            {(
              [
                ["online", "En línea"],
                ["in_person", "Presencial"],
              ] as const
            ).map(([value, label]) => {
              const active = format === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  aria-pressed={active}
                  className="flex-1 py-2.5 rounded-2xl text-[13px]"
                  style={{
                    background: active ? "rgba(232,217,181,0.18)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${active ? "rgba(232,217,181,0.4)" : "rgba(255,255,255,0.15)"}`,
                    color: active ? "#F3E9C8" : "var(--astralia-text)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {needsVerification && (
            <p className="text-[11px] mt-2" style={{ color: "var(--astralia-alert)" }}>
              Para organizar un evento presencial tu identidad debe estar verificada (PRD §19).
            </p>
          )}
        </fieldset>

        <TextField
          label={format === "online" ? "Enlace o plataforma (opcional)" : "Dirección"}
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={255}
          required={format === "in_person"}
        />

        <TextField label="Inicio" name="starts_at" type="datetime-local" min={minStart} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        <TextField label="Fin (opcional)" name="ends_at" type="datetime-local" min={startsAt || minStart} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        <TextField label="Cupo (opcional, vacío = sin límite)" name="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />

        {error && (
          <p className="text-xs" style={{ color: "var(--astralia-alert)" }} role="alert">
            {error}
          </p>
        )}

        <GoldButton type="submit" disabled={saving || !title.trim() || !startsAt || needsVerification}>
          {saving ? "Creando…" : "Crear evento"}
        </GoldButton>
        <p className="text-[11px] text-center" style={{ color: "#8E7FB0" }}>
          Solo lo verá tu grupo de edad (16-17 o 18+). En eventos presenciales, la dirección solo se muestra a quienes confirmen.
        </p>
      </form>

      <BottomNav active="/communities" />
    </main>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={null}>
      <NewEventForm />
    </Suspense>
  );
}

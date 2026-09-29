"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlacementsRow } from "@/components/astrology/PlacementsRow";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import * as astrologyService from "@/services/astrologyService";
import type { NatalChart } from "@/services/astrologyService";
import * as galaxyService from "@/services/galaxyService";
import * as personalityService from "@/services/personalityService";
import type { PersonalityResult } from "@/services/personalityService";
import * as profileService from "@/services/profileService";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ProfilePage() {
  const router = useRouter();
  const { status, profile, logout, refreshProfile } = useAuth();
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [personality, setPersonality] = useState<PersonalityResult | null>(null);
  const [galaxyCount, setGalaxyCount] = useState<number | null>(null);
  const [newThisWeek, setNewThisWeek] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

    astrologyService.fetchMyNatalChart().then(setChart).catch(() => {});
    personalityService.fetchMyPersonalityResult().then(setPersonality).catch(() => {});
    galaxyService
      .fetchGalaxy()
      .then((res) => {
        setGalaxyCount(res.count);
        setNewThisWeek(
          res.results.filter((s) => s.responded_at && Date.now() - new Date(s.responded_at).getTime() < WEEK_MS).length
        );
      })
      .catch(() => {});
  }, [status, router]);

  const sun = chart ? astrologyService.findPlacement(chart, "sun")?.sign : undefined;
  const moon = chart ? astrologyService.findPlacement(chart, "moon")?.sign : undefined;
  const ascendant = chart ? astrologyService.findPlacement(chart, "ascendant")?.sign : undefined;

  const startEditing = () => {
    setBioDraft(profile?.bio ?? "");
    setSaveError(null);
    setEditing(true);
  };

  const saveBio = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await profileService.updateBio(bioDraft.trim());
      await refreshProfile();
      setEditing(false);
    } catch {
      setSaveError("No pudimos guardar tu bio. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ color: "var(--astralia-lilac)" }}>
        <p className="text-sm">Cargando tu perfil…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col px-[22px] pt-[30px]" style={{ fontFamily: "var(--font-sans)", color: "var(--astralia-text)" }}>
      <div className="flex items-center justify-between relative">
        <Link
          href="/galaxy"
          aria-label="Volver"
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="text-[19px] font-semibold italic" style={{ fontFamily: "var(--font-serif)" }}>
          Mi Perfil
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Ajustes"
          aria-expanded={menuOpen}
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(232,217,181,0.35)", color: "#E8D9B5" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1h.1a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
          </svg>
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-[38px] z-10 rounded-2xl p-1.5 backdrop-blur-md"
            style={{ background: "rgba(34,26,59,0.95)", border: "1px solid rgba(232,217,181,0.35)" }}
          >
            <button type="button" onClick={handleLogout} className="text-[13px] px-4 py-2 rounded-xl w-full text-left" style={{ color: "#F3E9C8" }}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-3">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{ background: "#2C2249", border: "2px solid #E8D9B5", color: "#E8D9B5", boxShadow: "0 0 20px rgba(232,217,181,0.3)" }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div className="text-[19px] font-semibold mt-2.5" style={{ fontFamily: "var(--font-serif)" }}>
          {profile.name || "Sin nombre"}, {profile.age}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: "#B9A8DE" }}>
          {profile.city}, {profile.country}
        </div>
      </div>

      <div className="mt-3.5 mb-2">
        <PlacementsRow sun={sun} moon={moon} ascendant={ascendant} />
      </div>

      <p className="text-[9px] leading-[1.4] text-center mt-2 mb-1 px-3" style={{ color: "#8E7FB0" }}>
  La astrología en Astralia es una herramienta de autoconocimiento y compatibilidad, no una predicción.
</p>

      {personality && (
        <div
          className="flex items-center justify-center my-2.5 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(232,217,181,0.12)", border: "1px solid rgba(232,217,181,0.35)" }}
        >
          <span className="text-sm italic" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
            {personality.cosmic_name}
          </span>
        </div>
      )}

      {editing ? (
        <div className="flex flex-col gap-2 mt-1">
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Cuéntales a los demás qué tipo de amistades buscas…"
            className="rounded-2xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--astralia-text)" }}
          />
          {saveError && (
            <span className="text-xs" style={{ color: "var(--astralia-alert)" }}>
              {saveError}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs leading-[1.4] text-center px-1.5" style={{ color: profile.bio ? "#EFE9F7" : "#8E7FB0" }}>
          {profile.bio || "Aún no has escrito tu bio."}
        </p>
      )}

      {profile.interest_names.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap mt-3 mb-3.5">
          {profile.interest_names.map((name) => (
            <span
              key={name}
              className="text-[10px] rounded-full px-3 py-[5px]"
              style={{ background: "rgba(232,217,181,0.18)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="flex py-3 mb-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex-1 text-center">
          <div className="text-[19px] font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
            {galaxyCount ?? "—"}
          </div>
          <div className="text-[8px] uppercase tracking-[0.5px] mt-0.5" style={{ color: "#B9A8DE" }}>
            En tu galaxia
          </div>
        </div>
        <div className="flex-1 text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="text-[19px] font-semibold" style={{ fontFamily: "var(--font-serif)", color: "#F3E9C8" }}>
            {newThisWeek ?? "—"}
          </div>
          <div className="text-[8px] uppercase tracking-[0.5px] mt-0.5" style={{ color: "#B9A8DE" }}>
            Nuevas esta semana
          </div>
        </div>
      </div>

      {editing ? (
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex-1 py-3 rounded-full text-[13px] font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={saveBio}
            disabled={saving}
            className="flex-1 py-3 rounded-full text-[13px] font-bold disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="py-3 rounded-full text-[13px] font-bold"
          style={{ background: "linear-gradient(135deg,#E8D9B5,#C9A86B)", color: "#241A3D" }}
        >
          Editar perfil
        </button>
      )}

      <BottomNav active="/galaxy" />
    </main>
  );
}

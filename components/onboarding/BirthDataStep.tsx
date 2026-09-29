"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { LocationFields, useLocationField } from "@/components/profile/LocationFields";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { browserTimezone, geocodePlace } from "@/lib/geocode";

export type BirthData = {
  birth_date: string;
  birth_time: string;
  city: string;
  country: string;
  birth_place: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  current_latitude: number;
  current_longitude: number;
  consent_accepted: boolean;
};

export function BirthDataStep({ onNext }: { onNext: (data: BirthData) => void }) {
  const t = useTranslations("onboarding.birth");
  const locale = useLocale();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [livesSame, setLivesSame] = useState(true);
  const living = useLocationField();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!consent) {
      setError(t("consentRequired"));
      return;
    }

    setLoading(true);
    try {
      const birth = await geocodePlace(`${birthCity}, ${birthCountry}`, locale);
      if (!birth) {
        setError(t("cityNotFound"));
        return;
      }

      // dónde vive ahora: la misma ciudad de nacimiento, o la que indique (escrita o con la ubicación del dispositivo)
      const current = livesSame
        ? { city: birthCity.trim(), country: birthCountry.trim(), latitude: birth.latitude, longitude: birth.longitude }
        : await living.resolve();
      if (!current) return;

      onNext({
        birth_date: birthDate,
        birth_time: birthTime,
        city: current.city,
        country: current.country,
        birth_place: `${birthCity.trim()}, ${birthCountry.trim()}`,
        birth_latitude: birth.latitude,
        birth_longitude: birth.longitude,
        current_latitude: current.latitude,
        current_longitude: current.longitude,
        // simplificación v1: la zona horaria de nacimiento es la del navegador; se puede corregir al editar el perfil
        birth_timezone: browserTimezone(),
        consent_accepted: consent,
      });
    } catch {
      setError(t("geoFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs tracking-widest uppercase text-center" style={{ color: "var(--astralia-lilac)" }}>
        {t("step")}
      </p>
      <h1 className="mt-2 text-center text-2xl italic font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}>
        {t("title")}
      </h1>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
        {t("intro")}
      </p>

      <GlassCard className="mt-6 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField label={t("birthDate")} type="date" name="birth_date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <TextField label={t("birthTime")} type="time" name="birth_time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
          <TextField label={t("city")} type="text" name="city" required value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />
          <TextField label={t("country")} type="text" name="country" required value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

          <div className="flex flex-col gap-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <p className="pt-3 text-xs uppercase tracking-wide" style={{ color: "var(--astralia-lilac)" }}>
              {t("livesTitle")}
            </p>
            <label className="flex items-start gap-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>
              <input type="checkbox" checked={livesSame} onChange={(e) => setLivesSame(e.target.checked)} className="mt-0.5" />
              {t("livesSame")}
            </label>
            {!livesSame && <LocationFields field={living} />}
          </div>

          <label className="flex items-start gap-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            {t("consent")}
          </label>

          {error && (
            <p className="text-xs" style={{ color: "var(--astralia-alert)" }} role="alert">
              {error}
            </p>
          )}

          <GoldButton type="submit" disabled={loading} className="mt-2">
            {loading ? t("submitting") : t("submit")}
          </GoldButton>
        </form>
      </GlassCard>
    </div>
  );
}

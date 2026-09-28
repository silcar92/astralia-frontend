"use client";

import { useState, type FormEvent } from "react";

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
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!consent) {
      setError("Necesitamos tu consentimiento para calcular tu carta natal.");
      return;
    }

    setLoading(true);
    try {
      const location = await geocodePlace(`${city}, ${country}`);
      if (!location) {
        setError("No pudimos ubicar esa ciudad. Revisa que esté bien escrita.");
        return;
      }

      onNext({
        birth_date: birthDate,
        birth_time: birthTime,
        city,
        country,
        birth_place: `${city}, ${country}`,
        birth_latitude: location.latitude,
        birth_longitude: location.longitude,
        // simplificación v1: misma ciudad para ubicación de nacimiento y actual -- ver lib/geocode.ts
        current_latitude: location.latitude,
        current_longitude: location.longitude,
        birth_timezone: browserTimezone(),
        consent_accepted: consent,
      });
    } catch {
      setError("No pudimos calcular tu ubicación. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs tracking-widest uppercase text-center" style={{ color: "var(--astralia-lilac)" }}>
        Paso 1 de 4
      </p>
      <h1
        className="mt-2 text-center text-2xl italic font-semibold"
        style={{ fontFamily: "var(--font-serif)", color: "var(--astralia-text)" }}
      >
        Tu momento en el cielo
      </h1>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--astralia-lilac)" }}>
        Necesitamos tu fecha, hora y lugar de nacimiento para calcular tu carta natal.
      </p>

      <GlassCard className="mt-6 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Fecha de nacimiento"
            type="date"
            name="birth_date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <TextField
            label="Hora de nacimiento (opcional)"
            type="time"
            name="birth_time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
          />
          <TextField
            label="Ciudad de nacimiento"
            type="text"
            name="city"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            label="País de nacimiento"
            type="text"
            name="country"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <label className="flex items-start gap-2 text-xs" style={{ color: "var(--astralia-lilac)" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            Doy mi consentimiento explícito para que Astralia procese mis datos de nacimiento y calcule mi carta
            natal.
          </label>

          {error && (
            <p className="text-xs" style={{ color: "var(--astralia-alert)" }}>
              {error}
            </p>
          )}

          <GoldButton type="submit" disabled={loading} className="mt-2">
            {loading ? "Ubicando…" : "Continuar"}
          </GoldButton>
        </form>
      </GlassCard>
    </div>
  );
}

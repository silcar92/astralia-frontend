"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { TextField } from "@/components/ui/TextField";
import { currentPosition, geocodePlace, PositionError, reverseGeocode } from "@/lib/geocode";

export type LocationValue = { city: string; country: string; latitude: number; longitude: number };

// Estado del selector "¿dónde vives ahora?". Las coordenadas salen de la ubicación del dispositivo o de buscar el
// texto escrito; si se edita el texto, las coordenadas anteriores dejan de valer y se vuelven a buscar al confirmar.
export function useLocationField(initial?: { city?: string; country?: string }) {
  const locale = useLocale();
  const t = useTranslations("onboarding.location");
  const [city, setCityState] = useState(initial?.city ?? "");
  const [country, setCountryState] = useState(initial?.country ?? "");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const setCity = (value: string) => {
    setCityState(value);
    setCoords(null);
    setDirty(true);
  };
  const setCountry = (value: string) => {
    setCountryState(value);
    setCoords(null);
    setDirty(true);
  };

  const locate = async () => {
    setNotice(null);
    setLocating(true);
    try {
      const position = await currentPosition();
      setCoords(position);
      setDirty(true);
      // el GPS ya respondió; si no se puede traducir a ciudad, se pide escribirla pero las coordenadas se conservan
      const place = await reverseGeocode(position.latitude, position.longitude, locale).catch(() => null);
      if (place && (place.city || place.country)) {
        setCityState(place.city);
        setCountryState(place.country);
        setNotice({ kind: "ok", text: t("found", { place: [place.city, place.country].filter(Boolean).join(", ") }) });
      } else {
        setNotice({ kind: "error", text: t("cityUnknown") });
      }
    } catch (error) {
      const reason = error instanceof PositionError ? error.reason : "unavailable";
      setNotice({ kind: "error", text: t(`failed.${reason}`) });
    } finally {
      setLocating(false);
    }
  };

  // Devuelve la ubicación confirmada o null si no se pudo ubicar el texto escrito
  const resolve = async (): Promise<LocationValue | null> => {
    setNotice(null);
    if (coords) return { city, country, ...coords };
    const place = await geocodePlace(`${city}, ${country}`, locale);
    if (!place) {
      setNotice({ kind: "error", text: t("notFound") });
      return null;
    }
    return { city: city.trim() || place.city, country: country.trim() || place.country, latitude: place.latitude, longitude: place.longitude };
  };

  // rellena los campos con lo ya guardado sin marcarlos como cambiados
  const setInitial = (initialCity: string, initialCountry: string) => {
    setCityState(initialCity);
    setCountryState(initialCountry);
  };

  return { city, country, setCity, setCountry, setInitial, locate, locating, notice, dirty, resolve };
}

export function LocationFields({ field }: { field: ReturnType<typeof useLocationField> }) {
  const t = useTranslations("onboarding.location");

  return (
    <div className="flex flex-col gap-3">
      <TextField label={t("city")} name="current_city" value={field.city} onChange={(e) => field.setCity(e.target.value)} required />
      <TextField label={t("country")} name="current_country" value={field.country} onChange={(e) => field.setCountry(e.target.value)} required />
      <button
        type="button"
        onClick={field.locate}
        disabled={field.locating}
        className="self-start rounded-full px-4 py-2 text-xs disabled:opacity-60"
        style={{ background: "rgba(232,217,181,0.15)", border: "1px solid rgba(232,217,181,0.4)", color: "#F3E9C8" }}
      >
        {field.locating ? t("locating") : t("useMine")}
      </button>
      <p className="text-[11px] leading-[1.5]" style={{ color: "#8E7FB0" }}>
        {t("hint")}
      </p>
      {field.notice && (
        <p className="text-xs" style={{ color: field.notice.kind === "ok" ? "var(--astralia-gold)" : "var(--astralia-alert)" }} role={field.notice.kind === "ok" ? "status" : "alert"}>
          {field.notice.text}
        </p>
      )}
    </div>
  );
}

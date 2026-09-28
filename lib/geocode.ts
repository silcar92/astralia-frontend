export type GeocodeResult = { latitude: number; longitude: number; displayName: string };

/**
 * Nominatim (OpenStreetMap) — sin API key, gratis, respeta su política de uso (1 req/s, User-Agent propio).
 * Suficiente para el volumen de un onboarding; si el volumen crece, evaluar un proveedor con SLA.
 */
export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "es" },
  });

  if (!res.ok) return null;

  const results = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (results.length === 0) return null;

  // el backend guarda lat/lon con 6 decimales (~10 cm); Nominatim devuelve hasta 7 y el serializer los rechaza
  const [first] = results;
  return {
    latitude: Number(parseFloat(first.lat).toFixed(6)),
    longitude: Number(parseFloat(first.lon).toFixed(6)),
    displayName: first.display_name,
  };
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export type Place = { latitude: number; longitude: number; displayName: string; city: string; country: string };

type Address = Record<string, string>;

/**
 * Nominatim (OpenStreetMap): sin API key, gratis. Su política de uso pide como máximo 1 petición por segundo y que las
 * búsquedas las dispare la persona (no autocompletar mientras escribe). Suficiente para la beta; si el volumen crece,
 * evaluar un proveedor con SLA.
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";

// el backend guarda lat/lon con 6 decimales; Nominatim devuelve hasta 7 y el serializer los rechaza
const round = (n: number, decimals: number) => Number(n.toFixed(decimals));

function cityOf(address: Address): string {
  return address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? address.state ?? "";
}

export async function geocodePlace(query: string, language = "es"): Promise<Place | null> {
  if (!query.trim()) return null;

  const url = `${NOMINATIM}/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "Accept-Language": language } });
  if (!res.ok) return null;

  const results = (await res.json()) as { lat: string; lon: string; display_name: string; address?: Address }[];
  if (results.length === 0) return null;

  const [first] = results;
  const address = first.address ?? {};
  return {
    latitude: round(parseFloat(first.lat), 6),
    longitude: round(parseFloat(first.lon), 6),
    displayName: first.display_name,
    city: cityOf(address),
    country: address.country ?? "",
  };
}

export async function reverseGeocode(latitude: number, longitude: number, language = "es"): Promise<{ city: string; country: string } | null> {
  const url = `${NOMINATIM}/reverse?format=json&zoom=10&addressdetails=1&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(url, { headers: { "Accept-Language": language } });
  if (!res.ok) return null;

  const data = (await res.json()) as { address?: Address };
  const address = data.address ?? {};
  const city = cityOf(address);
  return city || address.country ? { city, country: address.country ?? "" } : null;
}

// Ubicación del dispositivo. Se redondea a 2 decimales (~1 km) antes de usarla: Astralia solo necesita la zona.
export function currentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: round(pos.coords.latitude, 2), longitude: round(pos.coords.longitude, 2) }),
      (err) => reject(err),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

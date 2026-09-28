const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "astralia_access_token";
const REFRESH_TOKEN_KEY = "astralia_refresh_token";

export type AuthTokens = { access: string; refresh: string };

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

export function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  return access && refresh ? { access, refresh } : null;
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;

  const res = await fetch(`${API_BASE_URL}/api/v1/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { access: string };
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  return data.access;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const tokens = getTokens();
  const buildHeaders = (accessToken?: string): HeadersInit => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...init?.headers,
  });

  let res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: buildHeaders(tokens?.access) });

  if (res.status === 401 && tokens) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: buildHeaders(newAccess) });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const DEFAULT_CANONICAL_API_URL = "https://api.saga.autos";

export function normalizeApiBaseUrl(rawUrl?: string | null): string {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return DEFAULT_CANONICAL_API_URL;
  }
  return trimmed.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
}

export const API_BASE_URL = getApiBaseUrl();

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanPath}`;
}

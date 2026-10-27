import { getApiUrl } from "./config";

export function normalizeImageUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = getApiUrl().replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

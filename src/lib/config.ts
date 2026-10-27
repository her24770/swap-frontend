/**
 * config.ts
 * Fuente única de la URL base del API. .
 */

export const DEFAULT_API_URL = "http://localhost:3001";

/** Lee la variable en cada llamada, para código que debe reaccionar a cambios de entorno (p. ej. tests). */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export const API_URL = getApiUrl();

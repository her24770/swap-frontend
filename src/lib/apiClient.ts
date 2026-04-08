/**
 * apiClient.ts
 * Cliente HTTP base para comunicación con el backend de Swap.
 *
 * - Lee el token JWT desde el authStore de Zustand.
 * - Inyecta automáticamente el token en el header Authorization.
 * - En error 401: limpia la sesión y redirige a /login.
 * - En error 403: llama al handler de permisos (configurable, por defecto
 *   lanza un error tipado que el componente puede mostrar al usuario).
 */

import { useAuthStore } from "../store/authStore";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
}

// Permite a la app registrar un handler global para errores 403
// (por ejemplo, mostrar un toast). Si no se registra nada, el
// error simplemente se propaga como excepción.
type ForbiddenHandler = (message: string) => void;
let onForbidden: ForbiddenHandler | null = null;

export function setForbiddenHandler(handler: ForbiddenHandler): void {
  onForbidden = handler;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  // Zustand almacena el estado en memoria; getState() funciona fuera de
  // componentes React sin violar las reglas de hooks.
  return useAuthStore.getState().token;
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(extra as Record<string, string>),
  });

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  // 401 — sesión expirada o token inválido
  if (response.status === 401) {
    useAuthStore.getState().logout();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    const err: ApiError = {
      status: 401,
      message: "Sesión expirada. Por favor inicia sesión nuevamente.",
    };
    throw err;
  }

  // 403 — autenticado pero sin permisos
  if (response.status === 403) {
    const message = "No tienes permisos para realizar esta acción.";

    if (onForbidden) {
      onForbidden(message);
    }

    const err: ApiError = { status: 403, message };
    throw err;
  }

  // Otros errores HTTP
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // respuesta sin cuerpo JSON — se usa el mensaje por defecto
    }
    const err: ApiError = { status: response.status, message };
    throw err;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── Métodos públicos ─────────────────────────────────────────────────────────

async function get<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(options?.headers),
    ...options,
  });
  return handleResponse<T>(response);
}

async function post<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(options?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function put<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(options?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function patch<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders(options?.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function del<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(options?.headers),
    ...options,
  });
  return handleResponse<T>(response);
}

export const apiClient = { get, post, put, patch, delete: del };
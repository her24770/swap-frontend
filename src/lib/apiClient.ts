/**
 * apiClient.ts
 * Cliente HTTP base para comunicación con el backend de Swap.
 *
 * - El token JWT viaja en cookie HttpOnly — el navegador lo incluye automáticamente.
 * - credentials: "include" en cada request para que la cookie se envíe cross-origin.
 * - En error 401: limpia la sesión y redirige a /login.
 * - En error 403: llama al handler de permisos (configurable).
 */

import { useAuthStore } from "../store/authStore";

export interface ApiError {
  status: number;
  message: string;
}

type ForbiddenHandler = (message: string) => void;
let onForbidden: ForbiddenHandler | null = null;

export function setForbiddenHandler(handler: ForbiddenHandler): void {
  onForbidden = handler;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function buildHeaders(extra?: HeadersInit): Headers {
  return new Headers({
    "Content-Type": "application/json",
    ...(extra as Record<string, string>),
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
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

  if (response.status === 403) {
    const message = "No tienes permisos para realizar esta acción.";
    if (onForbidden) onForbidden(message);
    const err: ApiError = { status: 403, message };
    throw err;
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    const err: ApiError = { status: response.status, message };
    throw err;
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

async function get<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(options?.headers),
    credentials: "include",
    ...options,
  });
  return handleResponse<T>(response);
}

async function post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(options?.headers),
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(options?.headers),
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders(options?.headers),
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

async function del<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(options?.headers),
    credentials: "include",
    ...options,
  });
  return handleResponse<T>(response);
}

export const apiClient = { get, post, put, patch, delete: del };

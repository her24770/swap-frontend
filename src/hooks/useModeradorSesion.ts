"use client";

import { useEffect, useState } from "react";
import { moderadorService } from "../services/moderadorService";
import { useModeradorAuthStore } from "../store/moderadorAuthStore";
import type { ApiError } from "../lib/apiClient";

interface UseModeradorSesionResult {
  moderador: ReturnType<typeof useModeradorAuthStore.getState>["moderador"];
  cargando: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

interface UseModeradorSesionOptions {
  // Cuando es false, no dispara GET /api/moderador/me. Uso: la propia
  // pagina de login no debe intentar hidratar la sesion (si hay una cookie
  // invalida/expirada, un 401 ahi mismo dispararia el redirect global de
  // apiClient.ts hacia /moderacion/login, recargando la pagina en loop).
  enabled?: boolean;
}

// Hidrata moderadorAuthStore desde GET /api/moderador/me si todavia no tiene
// sesion cargada (ej. al refrescar la pagina). Sigue el mismo patron que
// PerfilInterno.tsx usa para restaurar la sesion de usuario via /api/auth/me.
export function useModeradorSesion(
  options: UseModeradorSesionOptions = {}
): UseModeradorSesionResult {
  const { enabled = true } = options;
  const moderador = useModeradorAuthStore((s) => s.moderador);
  const login = useModeradorAuthStore((s) => s.login);
  const limpiarSesion = useModeradorAuthStore((s) => s.logout);
  const [cargando, setCargando] = useState(enabled && !moderador);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    try {
      await moderadorService.cerrarSesion();
    } catch {
      // si falla igual limpiamos el estado local
    }
    limpiarSesion();
  }

  useEffect(() => {
    if (!enabled) {
      setCargando(false);
      return;
    }

    if (moderador) {
      setCargando(false);
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        setCargando(true);
        setError(null);
        const sesion = await moderadorService.obtenerSesionActual();
        if (!cancelado) {
          login(sesion.moderador);
        }
      } catch (err) {
        if (!cancelado) {
          const apiError = err as ApiError;
          setError(apiError.message || "No fue posible obtener la sesion de moderador.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moderador, enabled]);

  return { moderador, cargando, error, logout };
}

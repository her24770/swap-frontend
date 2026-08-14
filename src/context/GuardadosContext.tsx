"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { publicacionService } from "../services/publicacionService";
import { useAuthStore } from "../store/authStore";
import type { Publicacion } from "../types/publicacion";

interface GuardadosContextValue {
  guardados: Publicacion[];
  idsGuardados: Set<number>;
  loading: boolean;
  guardarPublicacion: (id: number) => Promise<void>;
  eliminarGuardado: (id: number) => Promise<void>;
  isSaved: (id: number) => boolean;
  refetchGuardados: () => Promise<void>;
}

export const GuardadosContext = createContext<GuardadosContextValue | null>(null);

export function GuardadosProvider({ children }: { children: React.ReactNode }) {
  const usuario = useAuthStore((state) => state.usuario);
  const [guardados, setGuardados] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarGuardados = useCallback(async () => {
    if (!usuario) {
      setGuardados([]);
      return;
    }

    try {
      setLoading(true);
      const publicaciones = await publicacionService.getGuardadas();
      setGuardados(publicaciones.map((publicacion) => ({ ...publicacion, esGuardada: true })));
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    void cargarGuardados();
  }, [cargarGuardados]);

  const idsGuardados = useMemo(
    () => new Set(guardados.map((publicacion) => publicacion.id_publicacion)),
    [guardados]
  );

  const isSaved = useCallback(
    (id: number) => idsGuardados.has(id),
    [idsGuardados]
  );

  const guardarPublicacion = useCallback(async (id: number) => {
    if (!usuario) return;
    await publicacionService.guardar(id);
    await cargarGuardados();
  }, [usuario, cargarGuardados]);

  const eliminarGuardado = useCallback(async (id: number) => {
    if (!usuario) return;
    await publicacionService.eliminarGuardado(id);
    setGuardados((prev) => prev.filter((publicacion) => publicacion.id_publicacion !== id));
  }, [usuario]);

  const value = useMemo<GuardadosContextValue>(() => ({
    guardados,
    idsGuardados,
    loading,
    guardarPublicacion,
    eliminarGuardado,
    isSaved,
    refetchGuardados: cargarGuardados,
  }), [
    cargarGuardados,
    eliminarGuardado,
    guardarPublicacion,
    guardados,
    idsGuardados,
    isSaved,
    loading,
  ]);

  return (
    <GuardadosContext.Provider value={value}>
      {children}
    </GuardadosContext.Provider>
  );
}

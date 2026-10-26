"use client";

import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../lib/apiClient";

export interface EtiquetaBD {
  id_etiqueta: number;
  nombre: string;
  id_etiqueta_padre: number | null;
}

interface UseTodasEtiquetasOptions {
  /** When true, only root/parent tags (no course children) are returned. */
  soloPadres?: boolean;
}

export function useTodasEtiquetas(options: UseTodasEtiquetasOptions = {}) {
  const [todas, setTodas] = useState<EtiquetaBD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: EtiquetaBD[] }>("/api/etiqueta", { skipUnauthorizedRedirect: true })
      .then((res) => setTodas(res.data ?? []))
      .catch(() => {
        setError("No fue posible cargar las categorías.");
      })
      .finally(() => setLoading(false));
  }, []);

  const etiquetas = useMemo(
    () => (options.soloPadres ? todas.filter((e) => e.id_etiqueta_padre == null) : todas),
    [todas, options.soloPadres]
  );

  return { etiquetas, loading, error };
}

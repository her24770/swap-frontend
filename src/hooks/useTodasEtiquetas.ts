"use client";

import { useState, useEffect } from "react";
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
  const [etiquetas, setEtiquetas] = useState<EtiquetaBD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient
      .get<{ data: EtiquetaBD[] }>("/api/etiqueta", { skipUnauthorizedRedirect: true })
      .then((res) => {
        const list = res.data ?? [];
        setEtiquetas(
          options.soloPadres
            ? list.filter((e) => e.id_etiqueta_padre == null)
            : list
        );
      })
      .catch(() => {
        setError("No fue posible cargar las categorías.");
      })
      .finally(() => setLoading(false));
  }, [options.soloPadres]);

  return { etiquetas, loading, error };
}

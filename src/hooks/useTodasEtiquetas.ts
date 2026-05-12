"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";

export interface EtiquetaBD {
  id_etiqueta: number;
  nombre: string;
}

export function useTodasEtiquetas() {
  const [etiquetas, setEtiquetas] = useState<EtiquetaBD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: EtiquetaBD[] }>("/api/etiqueta")
      .then((res) => setEtiquetas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { etiquetas, loading };
}

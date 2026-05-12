"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";

export interface EstadoOpcion {
  id_estado: number;
  estado: string;
}

export function useEstados(tipo: string) {
  const [estados, setEstados] = useState<EstadoOpcion[]>([]);

  useEffect(() => {
    if (!tipo) return;
    apiClient
      .get<{ data: EstadoOpcion[] }>(`/api/estado?tipo=${tipo}`)
      .then((res) => setEstados(res.data))
      .catch(() => {});
  }, [tipo]);

  return estados;
}

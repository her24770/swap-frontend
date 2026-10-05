"use client";

import { useState } from "react";
import { reporteService } from "../services/reporteService";
import { useToast } from "./useToast";
import type { CrearReportePayload, Reporte } from "../types/reporte";

export function useReporte() {
  const toast = useToast();
  const [enviandoReporte, setEnviandoReporte] = useState(false);

  const crearReporte = async (payload: CrearReportePayload): Promise<Reporte | null> => {
    if (enviandoReporte) return null;

    try {
      setEnviandoReporte(true);
      const reporte = await reporteService.crearReporte(payload);
      toast.success("Tu reporte fue enviado para revisión.", "Reporte enviado");
      return reporte;
    } catch (error: any) {
      toast.error(error?.message ?? "No fue posible enviar el reporte.", "Error al reportar");
      return null;
    } finally {
      setEnviandoReporte(false);
    }
  };

  return {
    crearReporte,
    enviandoReporte,
  };
}

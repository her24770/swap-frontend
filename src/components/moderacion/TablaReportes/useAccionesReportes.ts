import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "../../../hooks/useToast";
import { reporteService } from "../../../services/reporteService";
import type { ReporteDetalle, ReporteTableData } from "../../../types/reporte";

// Lista local de reportes con cambio de estado optimista y carga del detalle.
export function useAccionesReportes(
  reportes: ReporteTableData[],
  onVerDetalles: (id: number) => Promise<ReporteDetalle> | ReporteDetalle
) {
  const toast = useToast();
  const t = useTranslations("moderacion.reportes");
  const [listaReportes, setListaReportes] = useState<ReporteTableData[]>(reportes);
  const [detalleReporte, setDetalleReporte] = useState<ReporteDetalle | null>(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState<number | null>(null);
  const [actualizandoEstadoId, setActualizandoEstadoId] = useState<number | null>(null);

  // Sincronizar estado local cuando las props cambian
  const [reportesPrevios, setReportesPrevios] = useState(reportes);
  if (reportesPrevios !== reportes) {
    setReportesPrevios(reportes);
    setListaReportes(reportes);
  }

  const handleVerDetalles = async (id: number) => {
    if (cargandoDetalleId) return;
    setCargandoDetalleId(id);
    try {
      const detalle = await onVerDetalles(id);
      setDetalleReporte(detalle);
    } catch (error) {
      toast.error((error instanceof Error ? error.message : undefined) ?? t("toasts.detalleError"), t("errorGenerico"));
    } finally {
      setCargandoDetalleId(null);
    }
  };

  // Función principal para cambiar el estado del reporte
  const handleCambiarEstado = async (id_reporte: number, nuevoEstado: string) => {
    const reporteActual = listaReportes.find((r) => r.id_reporte === id_reporte);
    const estadoAnterior = reporteActual?.estado;

    if (!estadoAnterior || estadoAnterior.toLowerCase() === nuevoEstado.toLowerCase()) {
      return;
    }

    setActualizandoEstadoId(id_reporte);

    setListaReportes((prev) =>
      prev.map((r) =>
        r.id_reporte === id_reporte ? { ...r, estado: nuevoEstado } : r
      )
    );

    try {
      await reporteService.actualizarEstadoReporte(id_reporte, nuevoEstado);
      toast.success(t("toasts.estadoActualizado"));
    } catch (error) {
      setListaReportes((prev) =>
        prev.map((r) =>
          r.id_reporte === id_reporte ? { ...r, estado: estadoAnterior } : r
        )
      );
      toast.error((error instanceof Error ? error.message : undefined) ?? t("toasts.estadoError"), t("errorGenerico"));
    } finally {
      setActualizandoEstadoId(null);
    }
  };

  return {
    listaReportes,
    detalleReporte,
    cerrarDetalle: () => setDetalleReporte(null),
    cargandoDetalleId,
    actualizandoEstadoId,
    handleVerDetalles,
    handleCambiarEstado,
  };
}

import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type {
  CrearReportePayload,
  Reporte,
  ReporteDetalle,
  ReportePaginationOptions,
  ResultadoBusquedaReporte,
} from "../types/reporte";

export const reporteService = {
  async crearReporte(payload: CrearReportePayload): Promise<Reporte> {
    const response = await apiClient.post<ApiResult<Reporte>>("/api/reportes", payload);
    return response.data;
  },

  async obtenerReportes(
    options: ReportePaginationOptions = {}
  ): Promise<ResultadoBusquedaReporte> {
    const response = await apiClient.post<ApiResult<ResultadoBusquedaReporte>>(
      "/api/reportes/buscar",
      options
    );

    return response.data;
  },

  async obtenerReportePorId(id: number): Promise<ReporteDetalle> {
    const response = await apiClient.get<ApiResult<ReporteDetalle>>(
      `/api/reportes/${id}`
    );

    return response.data;
  },

  async actualizarEstadoReporte(id: number, nuevoEstado: string): Promise<ReporteDetalle> {
    const response = await apiClient.put<ApiResult<ReporteDetalle>>(
      `/api/reportes/${id}`,
      { id_reporte: id, estado: nuevoEstado }
    );
    return response.data;
  }
};

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
    const imagenes = payload.imagenes ?? [];
    const body = imagenes.length > 0 ? crearReporteFormData(payload) : payload;
    const response = await apiClient.post<ApiResult<Reporte>>("/api/reportes", body);
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
};

function crearReporteFormData(payload: CrearReportePayload): FormData {
  const formData = new FormData();
  formData.append("tipo_objetivo", payload.tipo_objetivo);
  formData.append("id_objetivo", String(payload.id_objetivo));
  formData.append("motivo", payload.motivo);
  formData.append("detalle", payload.detalle ?? "");

  for (const imagen of payload.imagenes ?? []) {
    formData.append("imagenes", imagen);
  }

  return formData;
}

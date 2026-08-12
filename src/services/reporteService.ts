import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type { CrearReportePayload, Reporte } from "../types/reporte";

export const reporteService = {
  async crearReporte(payload: CrearReportePayload): Promise<Reporte> {
    const response = await apiClient.post<ApiResult<Reporte>>("/api/reportes", payload);
    return response.data;
  },
};

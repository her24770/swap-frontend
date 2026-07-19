import { apiClient } from "../lib/apiClient";
import type {
  AcuerdosHistorialResult,
  AcuerdosHistorialResponse,
  TipoHistorialAcuerdo,
} from "../types/acuerdo";

interface HistorialUsuarioOptions {
  page?: number;
  limit?: number;
  q?: string;
}

export const acuerdoService = {
  async getHistorialUsuario(
    idUsuario: number,
    tipo: TipoHistorialAcuerdo,
    options: HistorialUsuarioOptions = {}
  ): Promise<AcuerdosHistorialResult> {
    const params = new URLSearchParams({ tipo });
    if (options.page) params.set("page", options.page.toString());
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.q?.trim()) params.set("q", options.q.trim());

    const response = await apiClient.get<AcuerdosHistorialResponse>(
      `/api/acuerdo/user/${idUsuario}?${params.toString()}`
    );

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: options.page ?? 1,
        limit: options.limit ?? response.data.length,
      };
    }

    return response.data;
  },
};

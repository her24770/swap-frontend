import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type { PalabraRestringida, PalabraRestringidaInput } from "../types/palabra";

export const palabraService = {

  async listar(): Promise<PalabraRestringida[]> {
    const response = await apiClient.get<ApiResult<PalabraRestringida[]>>("/api/moderador/palabras");
    return response.data;
  },

  async crear(payload: PalabraRestringidaInput): Promise<PalabraRestringida> {
    const response = await apiClient.post<ApiResult<PalabraRestringida>>("/api/moderador/palabras", payload);
    return response.data;
  },

  async editar(id: number, payload: PalabraRestringidaInput): Promise<PalabraRestringida> {
    const response = await apiClient.patch<ApiResult<PalabraRestringida>>(`/api/moderador/palabras/${id}`, payload);
    return response.data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`/api/moderador/palabras/${id}`);
  },

};
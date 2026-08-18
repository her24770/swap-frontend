import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type {
  UsuarioModeracionFilters,
  UsuariosModeracionResult,
  CambiarEstadoCuentaPayload,
  CambiarEstadoCuentaResult,
  AdvertenciaPayload,
  AdvertenciaResult,
} from "../types/usuarioModeracion";

export const usuarioService = {

  async getModeracion(filters?: UsuarioModeracionFilters): Promise<UsuariosModeracionResult> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const query = params.toString();
    const response = await apiClient.get<ApiResult<UsuariosModeracionResult>>(
      `/api/moderador/usuarios${query ? `?${query}` : ""}`
    );
    return response.data;
  },

  async cambiarEstado(id: number, payload: CambiarEstadoCuentaPayload): Promise<CambiarEstadoCuentaResult> {
    const response = await apiClient.patch<ApiResult<CambiarEstadoCuentaResult>>(
      `/api/moderador/usuarios/${id}/estado`,
      payload
    );
    return response.data;
  },

  async crearAdvertencia(id: number, payload: AdvertenciaPayload): Promise<AdvertenciaResult> {
    const response = await apiClient.post<ApiResult<AdvertenciaResult>>(
      `/api/moderador/usuarios/${id}/advertencia`,
      payload
    );
    return response.data;
  },

};
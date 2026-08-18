import { apiClient } from "../lib/apiClient";
import { ApiResult } from "../types/ApiResult";
import type { UsuarioModeracionFilters, UsuariosModeracionResult } from "../types/usuarioModeracion";

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

};
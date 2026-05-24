// src/services/publicacionService.ts
import { apiClient } from "../lib/apiClient";
import type { PublicacionesResponse, Publicacion, PublicacionFilters, PublicacionDetalle, PublicacionDetalleResponse} from "../types/publicacion";

interface GuardadoPublicacion {
  id_usuario: number;
  id_publicacion: number;
  is_like: boolean;
  is_save: boolean;
  publicacion: Publicacion;
}

interface GuardadosResponse {
  message: string;
  data: Array<Publicacion | GuardadoPublicacion>;
}

function normalizarGuardados(data: GuardadosResponse["data"]): Publicacion[] {
  return data.map((item) => {
    if ("publicacion" in item) {
      return item.publicacion;
    }

    return item;
  });
}

export const publicacionService = {


    async getAll(filters?: PublicacionFilters): Promise<Publicacion[]> {

    // Convertir el objeto de filtros a query params 
    const params = new URLSearchParams();
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }   
    });
    }

    // Solictud al API
    const response = await apiClient.get<PublicacionesResponse>(`/api/publicacion?${params.toString()}`);
    
    
    return response.data;
  },

  async getById(id: number): Promise<PublicacionDetalle> {
    const response = await apiClient.get<PublicacionDetalleResponse>(`/api/publicacion/${id}`);
    return response.data;
  },

  async getGuardadas(): Promise<Publicacion[]> {
    const response = await apiClient.get<GuardadosResponse>("/api/guardados");
    return normalizarGuardados(response.data);
  },

  async guardar(id: number): Promise<void> {
    await apiClient.post(`/api/guardados/${id}`);
  },

  async eliminarGuardado(id: number): Promise<void> {
    await apiClient.delete(`/api/guardados/${id}`);
  }

};

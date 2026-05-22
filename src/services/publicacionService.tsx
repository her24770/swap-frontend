// src/services/publicacionService.ts
import { apiClient } from "../lib/apiClient";
import type { PublicacionesResponse, Publicacion, PublicacionFilters, PublicacionDetalle, PublicacionDetalleResponse} from "../types/publicacion";

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
    const response = await apiClient.get<PublicacionesResponse>("/api/publicacion/guardadas");
    return response.data;
  },

  async guardar(id: number): Promise<void> {
    await apiClient.post(`/api/publicacion/${id}/guardar`);
  },

  async eliminarGuardado(id: number): Promise<void> {
    await apiClient.delete(`/api/publicacion/${id}/guardar`);
  }

};

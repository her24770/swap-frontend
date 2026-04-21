// src/services/publicacionService.ts
import { apiClient } from "../lib/apiClient";
import type { PublicacionesResponse, Publicacion, PublicacionFilters } from "../types/publicacion";

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
  }
};
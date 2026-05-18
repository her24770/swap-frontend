// src/services/publicacionService.ts
import { apiClient } from "../lib/apiClient";
import type { PublicacionesResponse, Publicacion, PublicacionFilters, PublicacionDetalle, PublicacionDetalleResponse } from "../types/publicacion";

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

    // Añadir al objeto publicacionService en src/services/publicacionService.tsx

    async getGuardadas(): Promise<Publicacion[]> {
        const response = await apiClient.get<PublicacionesResponse>('/api/publicacion/guardadas');
        return response.data;
    },

    async saveGuardada(idPublicacion: number): Promise<void> {
        await apiClient.post('/api/publicacion/guardadas', { id_publicacion: idPublicacion });
    },

    async deleteGuardada(idPublicacion: number): Promise<void> {
        await apiClient.delete(`/api/publicacion/guardadas/${idPublicacion}`);
    }

};
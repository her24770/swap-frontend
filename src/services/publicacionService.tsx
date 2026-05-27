import { apiClient } from "../lib/apiClient";
import type { PublicacionesResponse, Publicacion, PublicacionFilters, PublicacionDetalle, PublicacionDetalleResponse, PublicacionesResult, FiltroPublicacionBody, FiltroPublicacionApiResponse } from "../types/publicacion";

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


    async getAll(filters?: PublicacionFilters): Promise<PublicacionesResult> {

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
    
    
    return {
      data: response.data,
      total: response.total ?? response.data.length,
    };
  },

  async getGlobalRecommendations(tipo?: string): Promise<Publicacion[]> {
    
    const response = await apiClient.get<PublicacionesResponse>(
      tipo ? `/api/recomendacion/globales/${tipo}` : `/api/recomendacion/globales/`
    );
    if(response.data.length === 0){
      return [];
    }

    return response.data;
  },

  async getPersonalizedRecommendations(): Promise<Publicacion[]> {

    const response = await apiClient.get<PublicacionesResponse>(
      "/api/recomendacion/personalizadas"
    );

    if (response.data.length === 0) {
      return [];
    }

    return response.data;
  },

  async getById(id: number): Promise<PublicacionDetalle> {
    const response = await apiClient.get<PublicacionDetalleResponse>(`/api/publicacion/${id}`);
    return response.data;
  },


  // ── Guardados ──────────────────────────────────────────────────────────
  async getGuardadas(): Promise<Publicacion[]> {
    const response = await apiClient.get<GuardadosResponse>("/api/guardados");
    return normalizarGuardados(response.data);
  },

  async guardar(id: number): Promise<void> {
    await apiClient.post(`/api/guardados/${id}`);
  },

  async eliminarGuardado(id: number): Promise<void> {
    await apiClient.delete(`/api/guardados/${id}`);
  },

  // ── Likes ──────────────────────────────────────────────────────────────
    async darLike(id: number): Promise<void> {
        await apiClient.post(`/api/likes/${id}`);
    },

    async quitarLike(id: number): Promise<void> {
        await apiClient.delete(`/api/likes/${id}`);
    },

    // publicaciones destacadas de usuario

    async getDestacadasUsuario(id_usuario: number): Promise<Publicacion[]> {
        const response = await apiClient.get<PublicacionesResponse>(`/api/publicacion/destacadas/user/${id_usuario}`);
        return response.data;
    },

    async actualizarDestacadasUsuario(id_publicacion: number, destacar: boolean): Promise<void> {
      await apiClient.patch(`/api/publicacion/${id_publicacion}/destacar`, { destacar });
    },

    // ── Filtros por vista ──────────────────────────────────────────────────
    async getFiltradasNegocios(body: FiltroPublicacionBody): Promise<Publicacion[]> {
      const response = await apiClient.post<FiltroPublicacionApiResponse>("/api/publicacion/buscar", body);
      return response.data.publicaciones;
    },

    async getFiltradasMateriales(body: FiltroPublicacionBody): Promise<Publicacion[]> {
      const response = await apiClient.post<FiltroPublicacionApiResponse>("/api/publicacion/buscar", body);
      return response.data.publicaciones;
    },

    async getFiltradasTutorias(body: FiltroPublicacionBody): Promise<Publicacion[]> {
      // Usará su propio endpoint cuando esté disponible
      const response = await apiClient.post<FiltroPublicacionApiResponse>("/api/publicacion/buscar", body);
      return response.data.publicaciones;
    },
};

import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import { apiClient, type ApiError } from '../../lib/apiClient';
import type { Publicacion, PublicacionFilters } from "../../types/publicacion";


export interface UsePublicacionesFilters extends PublicacionFilters {
  /** Si se provee, usa /api/publicacion/user/:id en lugar del endpoint general */
  idUsuario?: number;
}

export function usePublicaciones(initialFilters: UsePublicacionesFilters = {}) {
  const { publicacion: service } = useServices();
  const [data, setData] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicaciones = useCallback(async (filters: UsePublicacionesFilters) => {
    const { idUsuario, ...restFilters } = filters;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(restFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const query = params.toString();


      let result: Publicacion[];

      if (idUsuario) {
        // Endpoint por usuario: GET /api/publicacion/user/:id?tipo=material&all=true
        const response = await apiClient.get<{ message: string; data: Publicacion[] }>(
          `/api/publicacion/user/${idUsuario}${query ? `?${query}` : ""}`
        );
        result = response.data;
      } else {
        // Endpoint general: GET /api/publicacion?tipo=negocio&page=1
        const response = await apiClient.get<{ message: string; data: Publicacion[] }>(
          `/api/publicacion${query ? `?${query}` : ""}`
        );
        result = response.data;
      }

      setData(result);
    } catch (err: any) {
      const apiError = err as ApiError;
      console.error(apiError);
      setError(apiError.message || "Error al cargar publicaciones");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicaciones(initialFilters);
  }, [JSON.stringify(initialFilters), fetchPublicaciones]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchPublicaciones(initialFilters),
  };
}
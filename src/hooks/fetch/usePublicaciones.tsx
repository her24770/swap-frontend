import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Publicacion, PublicacionFilters } from "../../types/publicacion";

export function usePublicaciones(initialFilters: PublicacionFilters = {}) {
  const { publicacion: service } = useServices();
  const [data, setData] = useState<Publicacion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicaciones = useCallback(async (filters: PublicacionFilters) => {
    try {
      setLoading(true);
      setError(null);
      let result: Publicacion[];
      if (filters.recommended) {
        result = await service.getGlobalRecommendations(filters.tipo);
        setTotal(result.length);
      } else if (filters.personalized) {
        result = await service.getPersonalizedRecommendations();
        setTotal(result.length);
      } else {
        const response = await service.getAll(filters);
        result = response.data;
        setTotal(response.total);
      }
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchPublicaciones(initialFilters);
  }, [JSON.stringify(initialFilters), fetchPublicaciones]);

  return { data, total, loading, error, refetch: () => fetchPublicaciones(initialFilters) };
}

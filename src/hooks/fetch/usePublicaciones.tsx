import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Publicacion, PublicacionFilters } from "../../types/publicacion";

export function usePublicaciones(initialFilters: PublicacionFilters = {}) {
  const { publicacion: service } = useServices();
  const [data, setData] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicaciones = useCallback(async (filters: PublicacionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await service.getAll(filters);
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

  return { data, loading, error, refetch: () => fetchPublicaciones(initialFilters) };
}
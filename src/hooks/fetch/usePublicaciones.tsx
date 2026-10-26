import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Publicacion, PublicacionFilters } from "../../types/publicacion";
import type { ApiError } from '../../lib/apiClient';

export function usePublicaciones(initialFilters: PublicacionFilters = {}) {
  const { publicacion: service } = useServices();
  const [data, setData] = useState<Publicacion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Los filtros llegan como objeto nuevo en cada render: se compara su contenido serializado.
  const filtrosKey = JSON.stringify(initialFilters);
  const [filtrosPrevios, setFiltrosPrevios] = useState(filtrosKey);

  // Al cambiar los filtros se reinicia el estado de carga durante el render
  // (evita llamar setState de forma síncrona dentro del efecto).
  if (filtrosPrevios !== filtrosKey) {
    setFiltrosPrevios(filtrosKey);
    setLoading(true);
    setError(null);
  }

  // Consulta según los filtros, sin tocar el estado del hook.
  const cargar = useCallback(async (filters: PublicacionFilters) => {
    let result: Publicacion[];
    let totalResultado: number;
    if (filters.recommended) {
      result = await service.getGlobalRecommendations(filters.tipo);
      totalResultado = result.length;
    } else if (filters.personalized) {
      try {
        const personalizedResult = await service.getPersonalizedRecommendations();
        if (personalizedResult && personalizedResult.length > 0) {
          result = personalizedResult;
        } else {
          result = await service.getGlobalRecommendations(filters.tipo);
        }
      } catch {
        result = await service.getGlobalRecommendations(filters.tipo);
      }
      totalResultado = result.length;
    } else {
      const response = await service.getAll(filters);
      result = response.data;
      totalResultado = response.total;
    }
    return {
      items: Array.isArray(result) ? result : [],
      total: totalResultado,
    };
  }, [service]);

  // Recarga manual con los filtros actuales
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await cargar(JSON.parse(filtrosKey));
      setData(resultado.items);
      setTotal(resultado.total);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotal(0);
      setError((err as ApiError).message || "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  }, [cargar, filtrosKey]);

  useEffect(() => {
    let cancelado = false;

    cargar(JSON.parse(filtrosKey))
      .then((resultado) => {
        if (cancelado) return;
        setData(resultado.items);
        setTotal(resultado.total);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error(err);
        setData([]);
        setTotal(0);
        setError((err as ApiError).message || "Error al cargar publicaciones");
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cargar, filtrosKey]);

  return { data, total, loading, error, refetch };
}

import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Anuncio } from '../../types/anuncio';
import type { ApiError } from '../../lib/apiClient';


export function useAnuncios() {
    const { anuncio: anuncioService } = useServices();
    const [data, setData] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Recarga manual
    const fetchAnuncios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await anuncioService.getAnuncios();
            setData(result);
        } catch (err) {
            setError((err as ApiError).message || "Error al cargar los anuncios.");
        } finally {
            setLoading(false);
        }
    }, [anuncioService]);

    // Carga inicial
    useEffect(() => {
        let cancelado = false;

        anuncioService
            .getAnuncios()
            .then((result) => {
                if (!cancelado) setData(result);
            })
            .catch((err) => {
                if (cancelado) return;
                setError((err as ApiError).message || "Error al cargar los anuncios.");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [anuncioService]);

    return {
        data,
        loading,
        error,
        refetch: fetchAnuncios
    };
}

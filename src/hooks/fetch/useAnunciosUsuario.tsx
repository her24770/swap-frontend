import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Anuncio } from '../../types/anuncio';
import type { ApiError } from '../../lib/apiClient';

export function useAnunciosUsuario(userId: number) {
    const { anuncio: anuncioService } = useServices();
    const [data, setData] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userIdPrevio, setUserIdPrevio] = useState(userId);

    // Al cambiar el usuario consultado se reinicia el estado de carga durante el render
    // (evita llamar setState de forma síncrona dentro del efecto).
    if (userIdPrevio !== userId) {
        setUserIdPrevio(userId);
        setLoading(true);
        setError(null);
    }

    // Recarga manual
    const fetchAnunciosUsuario = useCallback(async () => {
        if (!userId || isNaN(userId)) return;

        try {
            setLoading(true);
            setError(null);

            const result = await anuncioService.getAnunciosdeUsuario(userId);
            setData(result);
        } catch (err) {
            console.error("Error en useAnunciosUsuario:", err);
            setError((err as ApiError).message || "Error al cargar los anuncios del usuario.");
        } finally {
            setLoading(false);
        }
    }, [userId, anuncioService]);

    useEffect(() => {
        if (!userId || isNaN(userId)) return;

        let cancelado = false;

        anuncioService
            .getAnunciosdeUsuario(userId)
            .then((result) => {
                if (!cancelado) setData(result);
            })
            .catch((err) => {
                if (cancelado) return;
                console.error("Error en useAnunciosUsuario:", err);
                setError((err as ApiError).message || "Error al cargar los anuncios del usuario.");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [userId, anuncioService]);

    return {
        data,
        loading,
        error,
        refetch: fetchAnunciosUsuario
    };
}

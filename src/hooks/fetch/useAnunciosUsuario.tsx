import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Anuncio } from '../../types/anuncio';
import type { ApiError } from '../../lib/apiClient';

export function useAnunciosUsuario(userId: number) {
    const { anuncio: anuncioService } = useServices();
    const [data, setData] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        fetchAnunciosUsuario();
    }, [fetchAnunciosUsuario]);

    return { 
        data, 
        loading, 
        error, 
        refetch: fetchAnunciosUsuario 
    };
}
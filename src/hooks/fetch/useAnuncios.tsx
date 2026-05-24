import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Anuncio } from '../../types/anuncio';


export function useAnuncios() {
    const { anuncio: anuncioService } = useServices();
    const [data, setData] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const fetchAnuncios = useCallback(async () => {
        try {
        setLoading(true);
        setError(null);
        
        const result = await anuncioService.getAnuncios();
        setData(result);
        } catch (err: any) {
        console.error("Error en useAnuncios:", err);
        setError(err.message || "Error al cargar los anuncios.");
        } finally {
        setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnuncios();
    }, [fetchAnuncios]);

    return { 
        data, 
        loading, 
        error, 
        refetch: fetchAnuncios 
    };
}
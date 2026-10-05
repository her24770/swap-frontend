import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext'; // Ajusta la ruta a tu ServiceContext
import type { Publicacion } from "../../types/publicacion";

/**
 * Hook personalizado para obtener el catálogo de publicaciones destacadas de un estudiante en SWAP.
 * @param userId ID único del usuario cuyas publicaciones se desean consultar.
 */
    export function usePublicacionesDestacadas(userId: number | undefined | null) {
    const { publicacion: service } = useServices();
    const [data, setData] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDestacadas = useCallback(async () => {
        if (!userId || isNaN(Number(userId))) {
        setLoading(false);
        return;
        }

        try {
        setLoading(true);
        setError(null);
        

        const result = await service.getDestacadasUsuario(Number(userId));
        setData(result);
        } catch (err: any) {
        console.error("Error en usePublicacionesDestacadas:", err);
        setError(err.message || "Error al cargar las publicaciones destacadas");
        } finally {
        setLoading(false);
        }
    }, [userId, service]);

    // Efecto que reacciona de forma automática si el perfil consultado cambia
    useEffect(() => {
        fetchDestacadas();
    }, [userId, fetchDestacadas]);

    return {
        data,
        loading,
        error,
        refetch: fetchDestacadas,
    };
}
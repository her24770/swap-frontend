import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext'; // Ajusta la ruta a tu ServiceContext
import type { Publicacion } from "../../types/publicacion";
import type { ApiError } from "../../lib/apiClient";

/**
 * Hook personalizado para obtener el catálogo de publicaciones destacadas de un estudiante en SWAP.
 * @param userId ID único del usuario cuyas publicaciones se desean consultar.
 */
export function usePublicacionesDestacadas(userId: number | undefined | null) {
    const { publicacion: service } = useServices();
    const idValido = userId && !isNaN(Number(userId)) ? Number(userId) : null;

    const [data, setData] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(idValido !== null);
    const [error, setError] = useState<string | null>(null);
    const [idPrevio, setIdPrevio] = useState(idValido);

    // Al cambiar el perfil consultado se reinicia el estado de carga durante el render
    if (idPrevio !== idValido) {
        setIdPrevio(idValido);
        setLoading(idValido !== null);
        setError(null);
    }

    const fetchDestacadas = useCallback(async () => {
        if (idValido === null) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await service.getDestacadasUsuario(idValido);
            setData(result);
        } catch (err) {
            console.error("Error en usePublicacionesDestacadas:", err);
            setError((err as ApiError).message || "Error al cargar las publicaciones destacadas");
        } finally {
            setLoading(false);
        }
    }, [idValido, service]);

    // Efecto que reacciona de forma automática si el perfil consultado cambia
    useEffect(() => {
        if (idValido === null) return;

        let cancelado = false;

        service
            .getDestacadasUsuario(idValido)
            .then((result) => {
                if (!cancelado) setData(result);
            })
            .catch((err) => {
                if (cancelado) return;
                console.error("Error en usePublicacionesDestacadas:", err);
                setError((err as ApiError).message || "Error al cargar las publicaciones destacadas");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [idValido, service]);

    return {
        data,
        loading,
        error,
        refetch: fetchDestacadas,
    };
}
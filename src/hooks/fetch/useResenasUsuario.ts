import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Resena } from "../../types/resena";
import type { ApiError } from "../../lib/apiClient";

/**
 * Hook personalizado para obtener y sincronizar las reseñas de un usuario en SWAP.
 * @param idUsuario ID único autoincremental del estudiante consultado.
 * @param tipoResena Rol activo en la interfaz ("material", "negocio", "tutoria").
 */
export function useResenas(idUsuario: number, tipoResena: string) {
    const { resena: service } = useServices();
    const [data, setData] = useState<Resena[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consultaPrevia, setConsultaPrevia] = useState({ idUsuario, tipoResena });

    // Al cambiar la consulta se reinicia el estado de carga durante el render
    if (consultaPrevia.idUsuario !== idUsuario || consultaPrevia.tipoResena !== tipoResena) {
        setConsultaPrevia({ idUsuario, tipoResena });
        setLoading(true);
        setError(null);
    }

    const fetchResenas = useCallback(async () => {
        if (!idUsuario || !tipoResena) return;

        try {
            setLoading(true);
            setError(null);

            const result = await service.obtenerResenasUsuario(idUsuario, tipoResena);
            setData(result);
        } catch (err) {
            setError((err as ApiError).message || "Error al cargar las reseñas del estudiante");
        } finally {
            setLoading(false);
        }
    }, [idUsuario, tipoResena, service]);

    useEffect(() => {
        if (!idUsuario || !tipoResena) return;

        let cancelado = false;

        service
            .obtenerResenasUsuario(idUsuario, tipoResena)
            .then((result) => {
                if (!cancelado) setData(result);
            })
            .catch((err) => {
                if (cancelado) return;
                setError((err as ApiError).message || "Error al cargar las reseñas del estudiante");
            })
            .finally(() => {
                if (!cancelado) setLoading(false);
            });

        return () => {
            cancelado = true;
        };
    }, [idUsuario, tipoResena, service]);

    return {
        data,
        loading,
        error,
        refetch: fetchResenas
    };
}
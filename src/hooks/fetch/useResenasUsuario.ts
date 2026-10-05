import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../../services/context/ServiceContext';
import type { Resena } from "../../types/resena";

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

    const fetchResenas = useCallback(async () => {
        if (!idUsuario || !tipoResena) return;

        try {
        setLoading(true);
        setError(null);
        
        const result = await service.obtenerResenasUsuario(idUsuario, tipoResena);
        setData(result);
        } catch (err: any) {
        console.error("Error al obtener reseñas del usuario:", err);
        setError(err.message || "Error al cargar las reseñas del estudiante");
        } finally {
        setLoading(false);
        }
    }, [idUsuario, tipoResena, service]);

    useEffect(() => {
        fetchResenas();
    }, [idUsuario, tipoResena, fetchResenas]);

    return { 
        data, 
        loading, 
        error, 
        refetch: fetchResenas 
    };
}
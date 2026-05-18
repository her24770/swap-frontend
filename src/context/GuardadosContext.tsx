import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { publicacionService } from '../services/publicacionService';
import { Publicacion } from '../types/publicacion';
import { useAuth } from '../hooks/useAuth'; // Consumiendo el hook de autenticación existente del proyecto

interface GuardadosContextType {
    guardados: Publicacion[];
    idsGuardados: number[];
    guardarPublicacion: (id: number) => Promise<void>;
    eliminarGuardado: (id: number) => Promise<void>;
    isSaved: (id: number) => boolean;
    loading: boolean;
}

export const GuardadosContext = createContext<GuardadosContextType | undefined>(undefined);

export const GuardadosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [guardados, setGuardados] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { usuario } = useAuth();

    const idsGuardados = useMemo(() => guardados.map((p) => p.id_publicacion), [guardados]);

    const cargarGuardados = useCallback(async () => {
        if (!usuario) {
            setGuardados([]);
            return;
        }
        setLoading(true);
        try {
            const data = await publicacionService.getGuardadas();
            setGuardados(data);
        } catch (error) {
            console.error("Error precargando publicaciones guardadas:", error);
        } finally {
            setLoading(false);
        }
    }, [usuario]);

    // Precarga al montarse o cambiar el estado de autenticación
    useEffect(() => {
        cargarGuardados();
    }, [cargarGuardados]);

    const guardarPublicacion = async (id: number) => {
        try {
            await publicacionService.saveGuardada(id);
            await cargarGuardados(); // Recarga para sincronizar el objeto completo
        } catch (error) {
            console.error("Error guardando publicación en favoritos:", error);
        }
    };

    const eliminarGuardado = async (id: number) => {
        try {
            await publicacionService.deleteGuardada(id);
            // Estado optimista local para respuesta en tiempo real en la UI
            setGuardados((prev) => prev.filter((p) => p.id_publicacion !== id));
        } catch (error) {
            console.error("Error removiendo publicación de guardados:", error);
        }
    };

    const isSaved = useCallback((id: number): boolean => {
        return idsGuardados.includes(id);
    }, [idsGuardados]);

    return (
        <GuardadosContext.Provider
            value={{
                guardados,
                idsGuardados,
                guardarPublicacion,
                eliminarGuardado,
                isSaved,
                loading,
            }}
        >
            {children}
        </GuardadosContext.Provider>
    );
};
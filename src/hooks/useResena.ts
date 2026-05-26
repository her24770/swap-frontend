import { useState } from "react";
import { useServices } from "../services/context/ServiceContext"; 
import { ResenaInput, ResenaUpdateInput } from "../schemas/schemaResenas";
import { Resena } from "../types/resena";
import { set } from "date-fns";

export function useResena() {
    const { resena: resenaService } = useServices();
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Envía una nueva reseña (texto + estrellas) hacia la API.
     */
    const crearNuevaResena = async (payload: ResenaInput): Promise<Resena | null> => {
        setLoading(true);
        setError(null);
        try {
            const resultado = await resenaService.crearResena(payload);
            return resultado;
        } catch (err: any) {
            // Captura el mensaje estructurado de error que envía tu backend o Axios
            const mensajeError = err?.response?.data?.message || err.message || "Error al enviar la reseña";
            setError(mensajeError);
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Modifica el contenido de una reseña guardada previamente.
     */
    const editarResenaExistente = async (idResena: number, payload: ResenaUpdateInput): Promise<Resena | null> => {
        setLoading(true);
        setError(null);
        try {
            const resultado = await resenaService.editarResena(idResena, payload);
            return resultado;
        } catch (err: any) {
            const mensajeError = err?.response?.data?.message || err.message || "Error al actualizar la reseña";
            setError(mensajeError);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        crearNuevaResena,
        editarResenaExistente,
        loading,
        error,
        setError, 
    };
}
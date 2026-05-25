"use client";

import { useState } from "react";
import { publicacionService } from "../services/publicacionService";
import { useUIStore } from "../store/uiStore";

export function useLike(
    idPublicacion: number,
    initialLikeado: boolean,
    initialCount: number
) {
    const [likeado, setLikeado] = useState(initialLikeado);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const { agregarNotificacion } = useUIStore();

    const toggleLike = async () => {
        if (loading || !idPublicacion) return;
        setLoading(true);

        const nuevoEstado = !likeado;
        // Optimistic update
        setLikeado(nuevoEstado);
        setCount((prev) => nuevoEstado ? prev + 1 : Math.max(0, prev - 1));

        try {
            if (nuevoEstado) {
                await publicacionService.darLike(idPublicacion);
            } else {
                await publicacionService.quitarLike(idPublicacion);
            }
        } catch (error: any) {
            // Revertir si falla
            setLikeado(!nuevoEstado);
            setCount((prev) => nuevoEstado ? Math.max(0, prev - 1) : prev + 1);
            // 409 significa que ya dio like o no había dado like — no es error grave
            if (error?.status !== 409) {
                agregarNotificacion({
                    tipo: "error",
                    mensaje: error.message || "No se pudo actualizar el like.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return { likeado, count, toggleLike, loading };
}



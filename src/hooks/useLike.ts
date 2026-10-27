"use client";

import { useState } from "react";
import { publicacionService } from "../services/publicacionService";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import type { ApiError } from "../lib/apiClient";

export function useLike(
    idPublicacion: number,
    initialLikeado: boolean,
    initialCount: number
) {
    const [likeado, setLikeado] = useState(initialLikeado);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const { agregarNotificacion } = useUIStore();
    const usuario = useAuthStore((s) => s.usuario);

    const [likeadoPrevio, setLikeadoPrevio] = useState(initialLikeado);
    const [countPrevio, setCountPrevio] = useState(initialCount);

    // Sincronizar si cambian las props iniciales
    if (likeadoPrevio !== initialLikeado) {
        setLikeadoPrevio(initialLikeado);
        setLikeado(initialLikeado);
    }
    if (countPrevio !== initialCount) {
        setCountPrevio(initialCount);
        setCount(initialCount);
    }

    const toggleLike = async () => {
        if (loading || !idPublicacion || !usuario) return;
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
        } catch (err) {
            const error = err as ApiError;
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



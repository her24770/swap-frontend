import { useState, useEffect } from "react";
import { apiClient, type ApiError } from "../lib/apiClient";
import type { TutorFiltrado } from "../types/publicacion";

export function useTutores() {

    const [data, setData] = useState<TutorFiltrado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        async function fetchTutores() {

            try {

                setLoading(true);
                setError(null);

                const response = await apiClient.get<{ data: TutorFiltrado[] }>(
                    "/api/recomendacion/tutores"
                );

                setData(response.data || []);

            } catch (err) {

                setError(
                    (err as ApiError).message ||
                    "Error al cargar tutores"
                );

            } finally {

                setLoading(false);
            }
        }

        fetchTutores();

    }, []);

    return {
        data,
        loading,
        error
    };
}
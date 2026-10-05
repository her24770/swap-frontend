import { useState, useEffect } from "react";
import { apiClient } from "../lib/apiClient";

export function useTutores() {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        async function fetchTutores() {

            try {

                setLoading(true);
                setError(null);

                const response = await apiClient.get<any>(
                    "/api/recomendacion/tutores"
                );

                setData(response.data || []);

            } catch (err: any) {

                console.error(err);

                setError(
                    err.message ||
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
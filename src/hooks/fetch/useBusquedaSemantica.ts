import { useState, useEffect } from "react";
import { apiClient } from "../../lib/apiClient";
import type { Publicacion } from "../../types/publicacion";

interface BusquedaResponse {
    data: Publicacion[];
}

export function useBusquedaSemantica(query: string, tipo?: string) {
    const [results, setResults] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ q: query.trim() });
                if (tipo) params.append("tipo", tipo);
                const response = await apiClient.get<BusquedaResponse>(`/api/busqueda?${params.toString()}`);
                setResults(response.data);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, tipo]);

    return { results, loading };
}

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useUIStore } from "../../../store/uiStore";
import type { CatalogPost } from "./catalogoVendedor";

// Cambia el estado de una publicación del catálogo conservando sus etiquetas.
export function useCambiarEstadoPost(setPosts: Dispatch<SetStateAction<CatalogPost[]>>) {
  const { agregarNotificacion } = useUIStore();

  return useCallback(
    async (pub: CatalogPost, nuevoEstado: string) => {
      try {
        await apiClient.put(`/api/publicacion/${pub.id}`, {
          estado: nuevoEstado,
          etiquetas: pub.categorias,
        });
        setPosts((prev) =>
          prev.map((p) => (p.id === pub.id ? { ...p, estado: nuevoEstado } : p))
        );
      } catch (err) {
        agregarNotificacion({
          tipo: "error",
          mensaje: (err as ApiError).message || "No fue posible cambiar el estado.",
        });
      }
    },
    [setPosts, agregarNotificacion]
  );
}

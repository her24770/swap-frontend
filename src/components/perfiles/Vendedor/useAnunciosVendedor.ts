import { useCallback } from "react";
import type { ApiError } from "../../../lib/apiClient";
import { useUIStore } from "../../../store/uiStore";
import { useAnunciosUsuario } from "../../../hooks/fetch/useAnunciosUsuario";
import { useServices } from "../../../services/context/ServiceContext";

// Anuncios de un usuario y su eliminación con confirmación.
export function useAnunciosVendedor(idUsuario: number) {
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const { anuncio: anuncioService } = useServices();
  const { data, loading, error, refetch } = useAnunciosUsuario(idUsuario);

  const handleEliminarAnuncio = useCallback((idAnuncio: number) => {
    mostrarConfirm({
      titulo: "Eliminar anuncio",
      mensaje: "¿Estás seguro de que deseas eliminar este anuncio de la plataforma? Esta acción es permanente.",
      onConfirm: async () => {
        try {
          await anuncioService.eliminarAnuncio(idAnuncio);
          agregarNotificacion({
            tipo: "success",
            mensaje: "Anuncio removido con éxito.",
          });
          refetch();
        } catch (err) {
          agregarNotificacion({
            tipo: "error",
            mensaje: (err as ApiError).message || "No fue posible eliminar el anuncio.",
          });
        }
      },
    });
  }, [agregarNotificacion, refetch, mostrarConfirm, anuncioService]);

  return { data, loading, error, refetch, handleEliminarAnuncio };
}

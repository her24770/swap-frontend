import { useCallback, useEffect, useState } from "react";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import { useUIStore } from "../../../store/uiStore";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import type { CatalogPost } from "../Vendedor/catalogoVendedor";

const mapPublicaciones = (data: Publicacion[]): CatalogPost[] =>
  data.map((pub) => ({
    id: pub.id_publicacion,
    title: pub.titulo,
    price: typeof pub.precio === "string" ? parseFloat(pub.precio) : pub.precio,
    description: pub.descripcion,
    tags: mapPublicacionEtiquetasToTags(pub.etiquetas, { name: "Tutoría" }),
    estado: pub.estadoRel?.estado ?? "activo",
    images: pub.imagenes?.map((img) => img.url_imagen) || [],
    tipo: "tutoria",
    categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
    isPinned: pub.is_pinned ?? false,
  }));

// Catálogo de tutorías de un usuario, con recarga, eliminación y destacado.
export function useCatalogoTutor(idUsuario: number | undefined) {
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const [catalogTutorias, setCatalogTutorias] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idUsuarioPrevio, setIdUsuarioPrevio] = useState(idUsuario);

  // Al cambiar el perfil consultado se reinicia el estado durante el render.
  if (idUsuarioPrevio !== idUsuario) {
    setIdUsuarioPrevio(idUsuario);
    setError(null);
    if (idUsuario) {
      setLoading(true);
    } else {
      setCatalogTutorias([]);
      setLoading(false);
    }
  }

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) return;

    try {
      const resTutorias = await apiClient.get<PublicacionesResponse>(
        `/api/publicacion/user/${idUsuario}?tipo=tutoria&all=true`
      );

      // Pinned first
      const sorted = mapPublicaciones(resTutorias.data).sort(
        (a, b) => Number(b.isPinned) - Number(a.isPinned)
      );

      setCatalogTutorias(sorted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las tutorías");
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  const handleEliminar = useCallback((id: number) => {
    mostrarConfirm({
      titulo: "Eliminar publicación",
      mensaje: "¿Seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          await apiClient.delete(`/api/publicacion/${id}`);
          agregarNotificacion({
            tipo: "success",
            mensaje: "Publicación eliminada exitosamente.",
          });
          fetchPublicaciones();
        } catch (err) {
          const apiError = err as ApiError;
          agregarNotificacion({
            tipo: "error",
            mensaje: apiError.message || "No fue posible eliminar la publicación.",
          });
        }
      },
    });
  }, [agregarNotificacion, fetchPublicaciones, mostrarConfirm]);

  const handlePinChange = useCallback((id: number, newPinned: boolean) => {
    setCatalogTutorias((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isPinned: newPinned } : p
      );
      return [...updated].sort(
        (a, b) => Number(b.isPinned) - Number(a.isPinned)
      );
    });
  }, []);

  // fetchPublicaciones solo hace setState después de un await
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  return {
    catalogTutorias,
    setCatalogTutorias,
    loading,
    error,
    fetchPublicaciones,
    handleEliminar,
    handlePinChange,
  };
}

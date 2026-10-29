import { useState, useEffect, useCallback } from "react";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useUIStore } from "../../../store/uiStore";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import type { CatalogPost } from "./catalogoVendedor";

const mapPublicaciones = (data: Publicacion[], tipoPub: string): CatalogPost[] =>
  data.map((pub) => ({
    id: pub.id_publicacion,
    title: pub.titulo,
    price: typeof pub.precio === "string" ? parseFloat(pub.precio) : pub.precio,
    description: pub.descripcion,
    tags: mapPublicacionEtiquetasToTags(pub.etiquetas, {
      name: tipoPub === "material" ? "Material" : "Negocio",
    }),
    estado: pub.estadoRel?.estado ?? "activo",
    images: pub.imagenes?.map((img) => img.url_imagen) || [],
    tipo: tipoPub,
    categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
    isPinned: pub.is_pinned ?? false,
  }));

const sortPinned = (list: CatalogPost[]) =>
  [...list].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

// Consulta las publicaciones del perfil sin tocar el estado del componente.
async function cargarPublicaciones(id: number) {
  const [resMaterial, resNegocio] = await Promise.all([
    apiClient.get<PublicacionesResponse>(`/api/publicacion/user/${id}?tipo=material&all=true`),
    apiClient.get<PublicacionesResponse>(`/api/publicacion/user/${id}?tipo=negocio&all=true`),
  ]);

  return {
    material: sortPinned(mapPublicaciones(resMaterial.data, "material")),
    negocio: sortPinned(mapPublicaciones(resNegocio.data, "negocio")),
  };
}

// Catálogos de materiales y negocios de un usuario, con recarga, eliminación y destacado.
export function useCatalogoVendedor(idUsuario: number | undefined) {
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const [catalogMaterial, setCatalogMaterial] = useState<CatalogPost[]>([]);
  const [catalogNegocio, setCatalogNegocio] = useState<CatalogPost[]>([]);
  const [loading, setLoading] = useState(Boolean(idUsuario));
  const [error, setError] = useState<string | null>(null);
  const [idUsuarioPrevio, setIdUsuarioPrevio] = useState(idUsuario);

  const fetchPublicaciones = useCallback(async () => {
    if (!idUsuario) {
      setCatalogMaterial([]);
      setCatalogNegocio([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { material, negocio } = await cargarPublicaciones(idUsuario);
      setCatalogMaterial(material);
      setCatalogNegocio(negocio);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "No fue posible obtener las publicaciones");
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

  const handlePinChangeMaterial = useCallback((id: number, newPinned: boolean) => {
    setCatalogMaterial((prev) =>
      sortPinned(prev.map((p) => (p.id === id ? { ...p, isPinned: newPinned } : p)))
    );
  }, []);

  const handlePinChangeNegocio = useCallback((id: number, newPinned: boolean) => {
    setCatalogNegocio((prev) =>
      sortPinned(prev.map((p) => (p.id === id ? { ...p, isPinned: newPinned } : p)))
    );
  }, []);

  if (idUsuarioPrevio !== idUsuario) {
    setIdUsuarioPrevio(idUsuario);
    setLoading(Boolean(idUsuario));
    setError(null);
    if (!idUsuario) {
      setCatalogMaterial([]);
      setCatalogNegocio([]);
    }
  }

  useEffect(() => {
    if (!idUsuario) return;

    let cancelado = false;

    cargarPublicaciones(idUsuario)
      .then(({ material, negocio }) => {
        if (cancelado) return;
        setCatalogMaterial(material);
        setCatalogNegocio(negocio);
      })
      .catch((err) => {
        if (cancelado) return;
        setError((err as ApiError).message || "No fue posible obtener las publicaciones");
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idUsuario]);

  return {
    catalogMaterial,
    catalogNegocio,
    setCatalogMaterial,
    setCatalogNegocio,
    loading,
    error,
    fetchPublicaciones,
    handleEliminar,
    handlePinChangeMaterial,
    handlePinChangeNegocio,
  };
}

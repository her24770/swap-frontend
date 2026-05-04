import { useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { Publicacion, VendedorResumen } from "../types/publicacion";

export function useDetallePublicacion() {
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState<VendedorResumen | null>(null);
  const [loadingVendedor, setLoadingVendedor] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleDetallesClick = async (publicacion: Publicacion) => {
    setSelectedPublicacion(publicacion);
    setSelectedVendedor(null);

    try {
      setLoadingVendedor(true);
      const data = await apiClient.get<any>(`/api/user/${publicacion.id_usuario}`);
      setSelectedVendedor({
        id_usuario: data.id_usuario,
        nombre: data.nombre,
        calificacion: data.calificacion,
        url_foto_perfil: data.url_foto_perfil,
      });
    } catch (error) {
      console.error("Error al cargar vendedor:", error);
    } finally {
      setLoadingVendedor(false);
    }
  };

  const handleClose = () => {
    setSelectedPublicacion(null);
    setSelectedVendedor(null);
  };

  return {
    selectedPublicacion,
    selectedVendedor,
    loadingVendedor,
    isSaved,
    setIsSaved,
    handleDetallesClick,
    handleClose,
  };
}
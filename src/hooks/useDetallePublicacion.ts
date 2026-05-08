import { useState } from "react";
import { publicacionService } from "../services/publicacionService";
import type { Publicacion, PublicacionDetalle } from "../types/publicacion";

export function useDetallePublicacion() {
  const [selectedPublicacion, setSelectedPublicacion] = useState<PublicacionDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleDetallesClick = async (publicacion: Publicacion) => {
    try {
      setLoadingDetalle(true);
      const detalle = await publicacionService.getById(publicacion.id_publicacion);
      setSelectedPublicacion(detalle);
    } catch (error){
      console.error("Error al obtener detalles de la publicación:", error);
    }finally {
      setLoadingDetalle(false);
    } 
  };

  const handleClose = () => {
    setSelectedPublicacion(null);
  };

  return {
    selectedPublicacion,
    loadingDetalle,
    isSaved,
    setIsSaved,
    handleDetallesClick,
    handleClose,
  };
}
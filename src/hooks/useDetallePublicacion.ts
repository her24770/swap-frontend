import { useState } from "react";
import { useTranslations } from "next-intl";
import { publicacionService } from "../services/publicacionService";
import { useToast } from "./useToast";
import type { Publicacion, PublicacionDetalle } from "../types/publicacion";

export function useDetallePublicacion() {
  const t = useTranslations("posts");
  const toast = useToast();
  const [selectedPublicacion, setSelectedPublicacion] = useState<PublicacionDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const handleDetallesClick = async (publicacion: Publicacion) => {
    try {
      setLoadingDetalle(true);
      const detalle = await publicacionService.getById(publicacion.id_publicacion);
      setSelectedPublicacion(detalle);
    } catch {
      toast.error(t("detalleError"));
    } finally {
      setLoadingDetalle(false);
    } 
  };

  const handleClose = () => {
    setSelectedPublicacion(null);
  };

  return {
    selectedPublicacion,
    loadingDetalle,
    handleDetallesClick,
    handleClose,
  };
}

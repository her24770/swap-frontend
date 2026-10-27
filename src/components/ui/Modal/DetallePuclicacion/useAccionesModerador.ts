import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUIStore } from "../../../../store/uiStore";
import { usuarioService } from "../../../../services/usuarioService";
import { publicacionService } from "../../../../services/publicacionService";

interface Options {
  sellerId?: number;
  publicacionId?: number;
  onClose: () => void;
  onEliminada?: () => void;
}

// Estado y acciones del moderador sobre una publicación: advertir al autor y eliminarla.
export function useAccionesModerador({ sellerId, publicacionId, onClose, onEliminada }: Options) {
  const tModeracion = useTranslations("moderacion.publicaciones");
  const { agregarNotificacion } = useUIStore();
  const [advertenciaAbierta, setAdvertenciaAbierta] = useState(false);
  const [enviandoAdvertencia, setEnviandoAdvertencia] = useState(false);
  const [eliminarAbierto, setEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleAdvertenciaModerador = async (payload: { motivo: string; detalle: string }) => {
    if (!sellerId) return;
    try {
      setEnviandoAdvertencia(true);
      await usuarioService.crearAdvertencia(sellerId, {
        motivo: payload.motivo,
        detalle: payload.detalle || undefined,
      });
      agregarNotificacion({ tipo: "success", mensaje: "Advertencia enviada exitosamente." });
      setAdvertenciaAbierta(false);
    } catch (error) {
      agregarNotificacion({
        tipo: "error",
        mensaje: error instanceof Error ? error.message : "No fue posible enviar la advertencia.",
      });
    } finally {
      setEnviandoAdvertencia(false);
    }
  };

  const handleEliminarModerador = async (payload: { motivo: string; detalle: string }) => {
    if (!publicacionId) return;
    try {
      setEliminando(true);
      await publicacionService.eliminarModeracion(publicacionId, payload);
      agregarNotificacion({ tipo: "success", mensaje: tModeracion("toasts.eliminadaSuccess") });
      setEliminarAbierto(false);
      onClose();
      onEliminada?.();
    } catch (error) {
      agregarNotificacion({
        tipo: "error",
        mensaje: error instanceof Error ? error.message : tModeracion("errorAccion"),
      });
    } finally {
      setEliminando(false);
    }
  };

  return {
    advertenciaAbierta,
    setAdvertenciaAbierta,
    enviandoAdvertencia,
    eliminarAbierto,
    setEliminarAbierto,
    eliminando,
    handleAdvertenciaModerador,
    handleEliminarModerador,
  };
}

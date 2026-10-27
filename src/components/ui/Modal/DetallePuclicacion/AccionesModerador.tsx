"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Flag, Trash2 } from "lucide-react";

interface AccionesModeradorProps {
  publicacionId?: number;
  sellerId?: number;
  /** Si el padre ya aporta su propio botón de eliminar, se oculta este. */
  ocultarEliminar: boolean;
  onReportar: () => void;
  onAdvertir: () => void;
  onEliminar: () => void;
}

// Botones del moderador: reportar la publicación, advertir al autor y eliminarla.
export default function AccionesModerador({
  publicacionId,
  sellerId,
  ocultarEliminar,
  onReportar,
  onAdvertir,
  onEliminar,
}: AccionesModeradorProps) {
  const tReporte = useTranslations("reporte");

  return (
    <div className="post-modal__actions post-modal__actions--moderador">
      {publicacionId && (
        <button
          type="button"
          className="button button--medium button--secondary button--full-width"
          onClick={onReportar}
        >
          <Flag size={16} /> {tReporte("moderador.reportar")}
        </button>
      )}
      <button
        type="button"
        className="button button--medium button--warning-outline button--full-width"
        onClick={onAdvertir}
        disabled={!sellerId}
      >
        <AlertTriangle size={16} /> {tReporte("moderador.advertencia")}
      </button>
      {!ocultarEliminar && (
        <button
          type="button"
          className="button button--medium button--danger button--full-width"
          onClick={onEliminar}
          disabled={!publicacionId}
        >
          <Trash2 size={16} /> {tReporte("moderador.eliminarPublicacion")}
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, Flag, Loader2 } from "lucide-react";
import { useToast } from "../../../../hooks/useToast";
import { useGuardados } from "../../../../hooks/useGuardados";

interface BarraLikesProps {
  likes: number;
  soloLectura: boolean;
  esPropiaPublicacion: boolean;
  publicacionId?: number;
  isSaved: boolean;
  onToggleSave?: () => void;
  onReportar: () => void;
}

// Contador de likes con los botones de reportar y guardar (ocultos en modo solo lectura).
export default function BarraLikes({
  likes,
  soloLectura,
  esPropiaPublicacion,
  publicacionId,
  isSaved,
  onToggleSave,
  onReportar,
}: BarraLikesProps) {
  const t = useTranslations("posts");
  const tReporte = useTranslations("reporte");
  const toast = useToast();
  const guardados = useGuardados();
  const [saving, setSaving] = useState(false);

  const guardada = publicacionId ? guardados.isSaved(publicacionId) : isSaved;

  const handleToggleSave = async () => {
    if (saving) return;
    if (!publicacionId) { onToggleSave?.(); return; }
    try {
      setSaving(true);
      if (guardada) {
        await guardados.eliminarGuardado(publicacionId);
      } else {
        await guardados.guardarPublicacion(publicacionId);
      }
      onToggleSave?.();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="post-modal__likes">
      {!soloLectura && (
        <>
          {!esPropiaPublicacion && publicacionId && (
            <button
              type="button"
              className="post-modal__report"
              onClick={onReportar}
              aria-label={tReporte("moderador.reportarPublicacionAria")}
            >
              <Flag size={18} />
            </button>
          )}
          <button
            type="button"
            className={`post-modal__save${guardada ? " post-modal__save--saved" : ""}`}
            onClick={handleToggleSave}
            aria-label={guardada ? t("save.removeAria") : t("save.addAria")}
            disabled={saving}
          >
            {saving
              ? <Loader2 size={18} className="post-modal__save-spinner" />
              : <Bookmark size={18} />
            }
          </button>
        </>
      )}
      <span className="post-modal__likes-count">{likes}</span>
    </div>
  );
}

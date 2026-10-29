import { Loader2, Trash2, Ban, RotateCcw, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Publicacion } from "../../../types/publicacion";
import "../../ui/Button/Button.css";

interface AccionesPublicacionProps {
  publicacion: Publicacion;
  onBajar: (publicacion: Publicacion) => void;
  onReactivar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
  busy: boolean;
}

export default function AccionesPublicacion({ publicacion, onBajar, onReactivar, onEliminar, busy }: AccionesPublicacionProps) {
  const t = useTranslations("moderacion.publicaciones");
  const estadoActual = publicacion.estadoRel?.estado?.toLowerCase();
  const esInactiva = estadoActual === "inactivo";
  const esPendiente = estadoActual === "pendiente";

  return (
    <div className="moderacion-publicaciones__actions">
      {esInactiva ? (
        <button
          type="button"
          className="button button--medium"
          onClick={() => onReactivar(publicacion)}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <RotateCcw size={16} />}
          {t("acciones.reactivar")}
        </button>
      ) : esPendiente ? (
        <>
          {/* Permite aprobar la publicacion retenida por fail-closed */}
          <button
            type="button"
            className="button button--medium button--success"
            onClick={() => onReactivar(publicacion)}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Check size={16} />}
            {t("acciones.aprobar")}
          </button>
          <button
            type="button"
            className="button button--medium button--warning"
            onClick={() => onBajar(publicacion)}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Ban size={16} />}
            {t("acciones.bajar")}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="button button--medium button--warning"
          onClick={() => onBajar(publicacion)}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Ban size={16} />}
          {t("acciones.bajar")}
        </button>
      )}
      <button
        type="button"
        className="button button--medium moderacion-publicaciones__danger-btn"
        onClick={() => onEliminar(publicacion)}
        disabled={busy}
      >
        {busy ? <Loader2 size={16} className="moderacion-publicaciones__spinner" /> : <Trash2 size={16} />}
        {t("acciones.eliminar")}
      </button>
    </div>
  );
}

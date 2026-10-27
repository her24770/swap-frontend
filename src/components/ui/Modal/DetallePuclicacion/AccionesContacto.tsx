"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { DetallePublicacionType } from "./DetallePublicacion";

interface AccionesContactoProps {
  type: DetallePublicacionType;
  showActions: boolean;
  soloLectura: boolean;
  esPropiaPublicacion: boolean;
  /** El panel de mensaje está abierto: se ocultan los botones que lo abren. */
  expandido: boolean;
  sellerId?: number;
  onAcordarCompra?: () => void;
  onSolicitarTutoria?: () => void;
  onVerCertificados?: (sellerId: number) => void;
  onAbrirMensaje: (callback?: () => void) => void;
}

// Botones para acordar una compra o solicitar una tutoría y ver certificados.
export default function AccionesContacto({
  type,
  showActions,
  soloLectura,
  esPropiaPublicacion,
  expandido,
  sellerId,
  onAcordarCompra,
  onSolicitarTutoria,
  onVerCertificados,
  onAbrirMensaje,
}: AccionesContactoProps) {
  const t = useTranslations("posts");
  const tSend = useTranslations("sendMessageModal");

  const visible =
    showActions && !soloLectura &&
    (type === "tutoria" || (type === "venta" && !esPropiaPublicacion && !expandido));
  if (!visible) return null;

  return (
    <div className="post-modal__actions">
      {type === "venta" && !esPropiaPublicacion && !expandido && (
        <button
          type="button"
          className="button button--medium button--full-width"
          onClick={() => onAbrirMensaje(onAcordarCompra)}
        >
          {t("actions.acordar")} <ChevronRight size={16} />
        </button>
      )}
      {type === "tutoria" && (
        <>
          {!esPropiaPublicacion && !expandido && (
            <button
              type="button"
              className="button button--medium button--full-width"
              onClick={() => onAbrirMensaje(onSolicitarTutoria)}
            >
              {tSend("requestTutoring")} <ChevronRight size={16} />
            </button>
          )}

          <button
            type="button"
            className="button button--medium button--warning button--full-width"
            onClick={() => { if (sellerId) onVerCertificados?.(sellerId); }}
            disabled={!onVerCertificados || !sellerId}
          >
            {t("actions.certificado")}
          </button>
        </>
      )}
    </div>
  );
}

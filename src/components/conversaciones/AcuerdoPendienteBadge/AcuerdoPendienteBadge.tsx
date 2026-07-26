"use client";

import { useTranslations } from "next-intl";
import { Handshake } from "lucide-react";
import "./AcuerdoPendienteBadge.css";

interface AcuerdoPendienteBadgeProps {
  /** Cuantos acuerdos pendientes tiene la conversacion (opcional, por defecto 1) */
  cantidad?: number;
}

/*
    Indicador visual que se muestra en un item de la lista de conversaciones
    cuando esa conversacion tiene al menos un acuerdo pendiente de respuesta.
*/
export default function AcuerdoPendienteBadge({ cantidad = 1 }: AcuerdoPendienteBadgeProps) {
  const t = useTranslations("acuerdoPendienteBadge");

  if (cantidad <= 0) return null;

  return (
    <span className="acuerdo-pendiente-badge" title={t("label")}>
      <Handshake size={12} aria-hidden="true" />
      {t("label")}
      {cantidad > 1 && <span className="acuerdo-pendiente-badge__count">{cantidad}</span>}
    </span>
  );
}
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import "./RecordatorioAcuerdo.css";

export interface AcuerdoRecordatorio {
  id_acuerdo: number;
  fecha_entrega: string; // ISO 8601
  lugar_entrega: string;
  observaciones: string;
  estado: string; // nombre del estado, ej. "activo"
  publicacion: {
    titulo: string;
    precio: number | string;
  };
}

interface RecordatorioAcuerdoProps {
  acuerdo: AcuerdoRecordatorio;
}

/*
    Recordatorio persistente dentro de la conversacion con los terminos del
    acuerdo ya aceptado (lugar, fecha, hora, objeto, costo y detalles).
    Solo se muestra mientras el acuerdo este "activo" (aceptado y aun no
    completado); una vez completado o cancelado deja de ser relevante.
*/
export default function RecordatorioAcuerdo({ acuerdo }: RecordatorioAcuerdoProps) {
  const t = useTranslations("recordatorioAcuerdo");
  const locale = useLocale();

  if (acuerdo.estado !== "activo") return null;

  const fechaEntrega = new Date(acuerdo.fecha_entrega);
  const ahora = new Date();
  const vencido = fechaEntrega.getTime() < ahora.getTime();

  const fechaTexto = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaEntrega);

  const horaTexto = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fechaEntrega);

  const diasRestantes = Math.round(
    (new Date(fechaEntrega.toDateString()).getTime() - new Date(ahora.toDateString()).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const relativo = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(diasRestantes, "day");

  const precioNumero = Number(acuerdo.publicacion.precio);
  const precioTexto = Number.isFinite(precioNumero) ? precioNumero.toFixed(2) : String(acuerdo.publicacion.precio);

  return (
    <div className={`recordatorio-acuerdo ${vencido ? "recordatorio-acuerdo--vencido" : ""}`.trim()}>
      <div className="recordatorio-acuerdo__header">
        <span className="recordatorio-acuerdo__titulo">{t("title")}</span>
        <span className="recordatorio-acuerdo__relativo">
          {vencido ? t("overdue") : relativo}
        </span>
      </div>

      <p className="recordatorio-acuerdo__objeto">
        {acuerdo.publicacion.titulo} · Q{precioTexto}
      </p>

      <div className="recordatorio-acuerdo__detalle">
        <Calendar size={14} aria-hidden="true" />
        <span>{fechaTexto}</span>
      </div>
      <div className="recordatorio-acuerdo__detalle">
        <Clock size={14} aria-hidden="true" />
        <span>{horaTexto}</span>
      </div>
      <div className="recordatorio-acuerdo__detalle">
        <MapPin size={14} aria-hidden="true" />
        <span>{acuerdo.lugar_entrega}</span>
      </div>
      {acuerdo.observaciones && (
        <div className="recordatorio-acuerdo__detalle recordatorio-acuerdo__detalle--observaciones">
          <FileText size={14} aria-hidden="true" />
          <span>{acuerdo.observaciones}</span>
        </div>
      )}
    </div>
  );
}
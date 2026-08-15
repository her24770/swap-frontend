"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  motivosReportePorObjetivo,
  TipoObjetivoReporte,
} from "../../../../types/reporte";
import "../Modal.css";
import "./ReporteModal.css";
import ReporteAcciones from "./ReporteAcciones";
import ReporteDetalle from "./ReporteDetalle";
import ReporteMotivos from "./ReporteMotivos";

const LIMITE_DETALLE_REPORTE = 500;

interface JustificanteModeracionModalProps {
  isOpen: boolean;
  tipoObjetivo: TipoObjetivoReporte;
  titulo: string;
  pregunta: string;
  enviando: boolean;
  motivosPersonalizados?: string[];
  onClose: () => void;
  onSubmit: (payload: { motivo: string; detalle: string }) => Promise<void> | void;
}

export default function JustificanteModeracionModal({
  isOpen,
  tipoObjetivo,
  titulo,
  pregunta,
  enviando,
  motivosPersonalizados,
  onClose,
  onSubmit,
}: JustificanteModeracionModalProps) {
  const motivos = useMemo(
    () => motivosPersonalizados ?? motivosReportePorObjetivo[tipoObjetivo],
    [motivosPersonalizados, tipoObjetivo]
  );
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string | null>(null);
  const [detalle, setDetalle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMotivoSeleccionado(null);
      setDetalle("");
    }
  }, [isOpen, tipoObjetivo]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!motivoSeleccionado || enviando) return;

    await onSubmit({
      motivo: motivoSeleccionado,
      detalle,
    });
  };

  const modal = (
    <div className="modal-overlay reporte-modal__overlay" onClick={onClose}>
      <form className="reporte-modal reporte-modal--moderacion" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="reporte-modal__header">
          <h2 className="reporte-modal__title">{titulo}</h2>
          <button type="button" className="reporte-modal__close" onClick={onClose} aria-label="Cerrar justificante">
            <X size={18} />
          </button>
        </div>

        <div className="reporte-modal__body">
          <section className="reporte-modal__section">
            <h3 className="reporte-modal__question">{pregunta}</h3>
            <ReporteMotivos<string>
              motivos={motivos}
              motivoSeleccionado={motivoSeleccionado}
              onSeleccionarMotivo={setMotivoSeleccionado}
            />
          </section>

          <ReporteDetalle
            valor={detalle}
            limiteCaracteres={LIMITE_DETALLE_REPORTE}
            onCambiar={setDetalle}
          />

          <ReporteAcciones
            puedeEnviar={Boolean(motivoSeleccionado)}
            enviando={enviando}
            onCancelar={onClose}
            textoEnviar="Confirmar"
          />
        </div>
      </form>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
}

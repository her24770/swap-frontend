"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useReporte } from "../../../../hooks/useReporte";
import {
  motivosReportePorObjetivo,
  MotivoReporte,
  TipoObjetivoReporte,
} from "../../../../types/reporte";
import "../Modal.css";
import "./ReporteModal.css";
import ReporteAcciones from "./ReporteAcciones";
import ReporteDetalle from "./ReporteDetalle";
import ReporteMotivos from "./ReporteMotivos";

const LIMITE_DETALLE_REPORTE = 500;

const preguntasPorObjetivo: Record<TipoObjetivoReporte, string> = {
  usuario: "¿Por qué quieres reportar al usuario?",
  comentario: "¿Por qué quieres reportar el comentario?",
  publicacion: "¿Por qué quieres reportar la publicación?",
};

interface ReporteModalProps {
  isOpen: boolean;
  tipoObjetivo: TipoObjetivoReporte;
  idObjetivo: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReporteModal({
  isOpen,
  tipoObjetivo,
  idObjetivo,
  onClose,
  onSuccess,
}: ReporteModalProps) {
  const { crearReporte, enviandoReporte } = useReporte();
  const motivos = useMemo(() => motivosReportePorObjetivo[tipoObjetivo], [tipoObjetivo]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<MotivoReporte | null>(null);
  const [detalle, setDetalle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMotivoSeleccionado(null);
      setDetalle("");
    }
  }, [isOpen, tipoObjetivo, idObjetivo]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!motivoSeleccionado || enviandoReporte) return;

    const reporte = await crearReporte({
      tipo_objetivo: tipoObjetivo,
      id_objetivo: idObjetivo,
      motivo: motivoSeleccionado,
      detalle,
    });

    if (reporte) {
      onSuccess?.();
      onClose();
    }
  };

  const modal = (
    <div className="modal-overlay reporte-modal__overlay" onClick={onClose}>
      <form className="reporte-modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="reporte-modal__header">
          <h2 className="reporte-modal__title">Reporte</h2>
          <button type="button" className="reporte-modal__close" onClick={onClose} aria-label="Cerrar reporte">
            <X size={18} />
          </button>
        </div>

        <div className="reporte-modal__body">
          <section className="reporte-modal__section">
            <h3 className="reporte-modal__question">{preguntasPorObjetivo[tipoObjetivo]}</h3>
            <ReporteMotivos
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
            enviando={enviandoReporte}
            onCancelar={onClose}
          />
        </div>
      </form>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
}

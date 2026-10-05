"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, ChevronRight, MapPin, Calendar, Clock, FileText, Tag, DollarSign } from "lucide-react";
import "../../Button/Button.css";
import "../Modal.css";
import "./SolicitudAcuerdoModal.css";

//El "objeto" del acuerdo y su "costo" vienen de la publicacion sobre la
//que se esta conversando: el modelo Acuerdo no tiene campos propios para
//guardarlos, siempre se derivan de la publicacion asociada (id_publicacion).
export interface PublicacionAcuerdo {
  id_publicacion: number;
  titulo: string;
  precio: number | string;
}

export interface SolicitudAcuerdoFormData {
  id_publicacion: number;
  lugar_entrega: string;
  fecha_entrega: string; // ISO 8601, combina fecha + hora
  observaciones: string;
}

export interface AcuerdoInicial {
  id_acuerdo: number;
  fecha_entrega: string;
  lugar_entrega: string;
  observaciones: string;
}

interface SolicitudAcuerdoModalProps {
  isOpen?: boolean;
  publicacion: PublicacionAcuerdo;
  acuerdoInicial?: AcuerdoInicial;
  onClose: () => void;
  onSubmit: (data: SolicitudAcuerdoFormData) => void | Promise<void>;
  isSaving?: boolean;
}

const LUGAR_MAX_LENGTH = 100;
const OBSERVACIONES_MAX_LENGTH = 200;

function getFechaMinima(): string {
  return new Date().toISOString().split("T")[0];
}

export default function SolicitudAcuerdoModal({
  isOpen = true,
  publicacion,
  acuerdoInicial,
  onClose,
  onSubmit,
  isSaving = false,
}: SolicitudAcuerdoModalProps) {
  const t = useTranslations("solicitudAcuerdoModal");

  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [detalles, setDetalles] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  //Resetea el formulario cada vez que se abre
  useEffect(() => {
    if(!isOpen) return;
    if(acuerdoInicial){
      const fechaAcuerdo = new Date(acuerdoInicial.fecha_entrega);

      setLugar(acuerdoInicial.lugar_entrega);
      setFecha(fechaAcuerdo.toISOString().split("T")[0]);
      setHora(fechaAcuerdo.toTimeString().slice(0, 5));
      setDetalles(acuerdoInicial.observaciones);
    }else {
      setLugar("");
      setFecha("");
      setHora("");
      setDetalles("");
      setErrores({});
    }
    setErrores({});
  }, [isOpen, acuerdoInicial]);

  if (!isOpen) return null;

  const precioNumero = Number(publicacion.precio);
  const precioTexto = Number.isFinite(precioNumero) ? precioNumero.toFixed(2) : String(publicacion.precio);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!lugar.trim()) nuevosErrores.lugar = t("errors.required");
    if (!fecha) nuevosErrores.fecha = t("errors.required");
    if (!hora) nuevosErrores.hora = t("errors.required");
    if (!detalles.trim()) nuevosErrores.detalles = t("errors.required");

    if (fecha) {
      const fechaSeleccionada = new Date(`${fecha}T${hora || "00:00"}`);
      if (fechaSeleccionada.getTime() < Date.now()) {
        nuevosErrores.fecha = t("errors.pastDate");
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (isSaving) return;
    if (!validar()) return;

    onSubmit({
      id_publicacion: publicacion.id_publicacion,
      lugar_entrega: lugar.trim(),
      fecha_entrega: new Date(`${fecha}T${hora}`).toISOString(),
      observaciones: detalles.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="solicitud-acuerdo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="solicitud-acuerdo-modal__header">
          <h2 className="solicitud-acuerdo-modal__title">{t("title")}</h2>
          <button
            type="button"
            className="solicitud-acuerdo-modal__close"
            onClick={onClose}
            aria-label={t("actions.cancel")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Objeto y costo: informativos, se derivan de la publicacion */}
        <div className="solicitud-acuerdo-modal__resumen">
          <div className="solicitud-acuerdo-modal__resumen-row">
            <Tag size={16} aria-hidden="true" />
            <span className="solicitud-acuerdo-modal__resumen-label">{t("fields.objeto")}</span>
            <span className="solicitud-acuerdo-modal__resumen-value">{publicacion.titulo}</span>
          </div>
          <div className="solicitud-acuerdo-modal__resumen-row">
            <DollarSign size={16} aria-hidden="true" />
            <span className="solicitud-acuerdo-modal__resumen-label">{t("fields.costo")}</span>
            <span className="solicitud-acuerdo-modal__resumen-value">Q{precioTexto}</span>
          </div>
        </div>

        <div className="solicitud-acuerdo-modal__field">
          <label className="solicitud-acuerdo-modal__label" htmlFor="acuerdo-lugar">
            <MapPin size={15} aria-hidden="true" />
            {t("fields.lugar")}
          </label>
          <input
            id="acuerdo-lugar"
            type="text"
            className="solicitud-acuerdo-modal__input"
            value={lugar}
            maxLength={LUGAR_MAX_LENGTH}
            placeholder={t("fields.lugarPlaceholder")}
            onChange={(e) => setLugar(e.target.value)}
            disabled={isSaving}
          />
          {errores.lugar && <span className="solicitud-acuerdo-modal__error">{errores.lugar}</span>}
        </div>

        <div className="solicitud-acuerdo-modal__row">
          <div className="solicitud-acuerdo-modal__field">
            <label className="solicitud-acuerdo-modal__label" htmlFor="acuerdo-fecha">
              <Calendar size={15} aria-hidden="true" />
              {t("fields.fecha")}
            </label>
            <input
              id="acuerdo-fecha"
              type="date"
              className="solicitud-acuerdo-modal__input"
              value={fecha}
              min={getFechaMinima()}
              onChange={(e) => setFecha(e.target.value)}
              disabled={isSaving}
            />
            {errores.fecha && <span className="solicitud-acuerdo-modal__error">{errores.fecha}</span>}
          </div>

          <div className="solicitud-acuerdo-modal__field">
            <label className="solicitud-acuerdo-modal__label" htmlFor="acuerdo-hora">
              <Clock size={15} aria-hidden="true" />
              {t("fields.hora")}
            </label>
            <input
              id="acuerdo-hora"
              type="time"
              className="solicitud-acuerdo-modal__input"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              disabled={isSaving}
            />
            {errores.hora && <span className="solicitud-acuerdo-modal__error">{errores.hora}</span>}
          </div>
        </div>

        <div className="solicitud-acuerdo-modal__field">
          <label className="solicitud-acuerdo-modal__label" htmlFor="acuerdo-detalles">
            <FileText size={15} aria-hidden="true" />
            {t("fields.detalles")}
          </label>
          <textarea
            id="acuerdo-detalles"
            className="solicitud-acuerdo-modal__textarea"
            value={detalles}
            maxLength={OBSERVACIONES_MAX_LENGTH}
            placeholder={t("fields.detallesPlaceholder")}
            onChange={(e) => setDetalles(e.target.value)}
            disabled={isSaving}
            rows={3}
          />
          <span className="solicitud-acuerdo-modal__counter">
            {detalles.length}/{OBSERVACIONES_MAX_LENGTH}
          </span>
          {errores.detalles && <span className="solicitud-acuerdo-modal__error">{errores.detalles}</span>}
        </div>

        <div className="solicitud-acuerdo-modal__footer">
          <button
            type="button"
            className="solicitud-acuerdo-modal__btn-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("actions.cancel")}
          </button>
          <button
            type="button"
            className="button button--medium"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? t("actions.sending") : t("actions.send")} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
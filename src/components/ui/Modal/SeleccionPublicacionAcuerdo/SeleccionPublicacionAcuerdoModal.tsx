"use client";

import { X, ChevronRight, Tag, DollarSign } from "lucide-react";
import type { PublicacionAcuerdo } from "../SolicitudAcuerdo/SolicitudAcuerdoModal";
import "../../Button/Button.css";
import "../Modal.css";
import "./SeleccionPublicacionAcuerdoModal.css";

interface SeleccionPublicacionAcuerdoModalProps {
  isOpen: boolean;
  publicaciones: PublicacionAcuerdo[];
  onClose: () => void;
  onSelect: (publicacion: PublicacionAcuerdo) => void;
}

export default function SeleccionPublicacionAcuerdoModal({
  isOpen,
  publicaciones,
  onClose,
  onSelect,
}: SeleccionPublicacionAcuerdoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="seleccion-publicacion-acuerdo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="seleccion-publicacion-acuerdo__header">
          <div>
            <h2 className="seleccion-publicacion-acuerdo__title">
              Seleccionar publicación
            </h2>
            <p className="seleccion-publicacion-acuerdo__description">
              Selecciona la publicación sobre la que deseas crear el acuerdo.
            </p>
          </div>

          <button
            type="button"
            className="seleccion-publicacion-acuerdo__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="seleccion-publicacion-acuerdo__options">
          {publicaciones.map((publicacion) => {
            const precio = Number(publicacion.precio);
            const precioTexto = Number.isFinite(precio)
              ? precio.toFixed(2)
              : String(publicacion.precio);

            return (
              <button
                key={publicacion.id_publicacion}
                type="button"
                className="seleccion-publicacion-acuerdo__option"
                onClick={() => onSelect(publicacion)}
              >
                <div className="seleccion-publicacion-acuerdo__option-info">
                  <div className="seleccion-publicacion-acuerdo__option-row">
                    <Tag size={16} aria-hidden="true" />
                    <span>{publicacion.titulo}</span>
                  </div>

                  <div className="seleccion-publicacion-acuerdo__option-row seleccion-publicacion-acuerdo__price">
                    <DollarSign size={15} aria-hidden="true" />
                    <span>Q{precioTexto}</span>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="seleccion-publicacion-acuerdo__chevron"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { X } from "lucide-react";
import "../Modal.css";
import "./TerminosyCondiciones.css";
import TerminosContenido from "./TerminosContenido";
import PrivacidadContenido from "./PrivacidadContenido";

interface TerminosyCondicionesProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "terminos" | "privacidad";

export default function TerminosyCondiciones({ isOpen, onClose }: TerminosyCondicionesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("terminos");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="terminos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="terminos-modal__header">
          <h3 className="terminos-modal__title">Términos y Política de Privacidad</h3>
          <button
            type="button"
            className="terminos-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="terminos-modal__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "terminos"}
            className={`terminos-modal__tab ${activeTab === "terminos" ? "terminos-modal__tab--active" : ""}`}
            onClick={() => setActiveTab("terminos")}
          >
            Términos y Condiciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "privacidad"}
            className={`terminos-modal__tab ${activeTab === "privacidad" ? "terminos-modal__tab--active" : ""}`}
            onClick={() => setActiveTab("privacidad")}
          >
            Política de Privacidad
          </button>
        </div>

        <div className="terminos-modal__body">
          <div className="terminos-modal__content">
            {activeTab === "terminos" ? <TerminosContenido /> : <PrivacidadContenido />}
          </div>
        </div>
      </div>
    </div>
  );
}

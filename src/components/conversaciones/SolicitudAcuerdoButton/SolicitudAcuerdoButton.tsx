"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Handshake } from "lucide-react";
import SolicitudAcuerdoModal, {
  type PublicacionAcuerdo,
  type SolicitudAcuerdoFormData,
} from "../../ui/Modal/SolicitudAcuerdo/SolicitudAcuerdoModal";
import "../../ui/Button/Button.css";
import "./SolicitudAcuerdoButton.css";

interface SolicitudAcuerdoButtonProps {
  publicacion: PublicacionAcuerdo;
  onSubmit: (data: SolicitudAcuerdoFormData) => void | Promise<void>;
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
}

/*
    Boton para abrir la ventana emergente de solicitud de acuerdo desde
    dentro de una conversacion. La logica de envio (llamada al backend)
    se recibe por props y se conecta en la tarea de integracion (ST-H36-6).
*/
export default function SolicitudAcuerdoButton({
  publicacion,
  onSubmit,
  isSaving = false,
  disabled = false,
  className = "",
}: SolicitudAcuerdoButtonProps) {
  const t = useTranslations("solicitudAcuerdoModal");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: SolicitudAcuerdoFormData) => {
    await onSubmit(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`button button--small solicitud-acuerdo-btn ${className}`.trim()}
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        <Handshake size={16} aria-hidden="true" />
        {t("triggerButton")}
      </button>

      {isModalOpen && (
        <SolicitudAcuerdoModal
          isOpen={isModalOpen}
          publicacion={publicacion}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
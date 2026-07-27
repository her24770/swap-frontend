"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import "../../Button/Button.css";
import "../Modal.css";
import "../EnviarMensaje/EnviarMensaje.css";
import "./ContactarUsuarioModal.css";

interface ContactarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinatarioNombre: string;
  isSending?: boolean;
  onEnviar: (mensaje: string) => void;
}

export default function ContactarUsuarioModal({
  isOpen,
  onClose,
  destinatarioNombre,
  isSending = false,
  onEnviar,
}: ContactarUsuarioModalProps) {
  const t = useTranslations("sendMessageModal");
  const [mensaje, setMensaje] = useState("");

  if (!isOpen) return null;

  const handleEnviar = () => {
    if (!mensaje.trim()) return;
    onEnviar(mensaje.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contactar-usuario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="enviar-mensaje-panel">
          <div className="enviar-mensaje-panel__header">
            <h2 className="enviar-mensaje-panel__title">
              {t("title", { name: destinatarioNombre })}
            </h2>
          </div>

          <div className="enviar-mensaje-panel__section enviar-mensaje-panel__section--grow">
            <label className="enviar-mensaje-panel__label">{t("messageLabel")}</label>
            <textarea
              className="enviar-mensaje-panel__textarea"
              placeholder={t("placeholder")}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              autoFocus
            />
            <span className="enviar-mensaje-panel__hint">{t("hint")}</span>
          </div>

          <div className="enviar-mensaje-panel__footer">
            <button
              type="button"
              className="enviar-mensaje-panel__btn-cancel"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              className="button button--medium"
              onClick={handleEnviar}
              disabled={!mensaje.trim() || isSending}
            >
              {isSending ? t("sending") : t("send")}
              {!isSending && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

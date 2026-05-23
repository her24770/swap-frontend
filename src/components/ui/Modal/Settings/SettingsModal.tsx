"use client";
import { X, SunMoon,  Globe } from "lucide-react";
import { useTheme } from "../../../../context/Themecontext";
import LocaleSwitcher from "../../../layout/Navbar/LocaleSwitcher/LocaleSwitcher";
import ThemeToggle from "../../../ui/Button/ThemeToggle/ThemeToggle";
import "../Modal.css";
import "./SettingsModal.css"; 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggle: toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal__header">
          <h3 className="settings-modal__title">Ajustes de la aplicación</h3>
          <button
            type="button"
            className="settings-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-modal__body">
            <div className="settings-modal__row">
                <div className="settings-modal__info">
                <SunMoon size={18} className="settings-modal__icon" />
                <div>
                    <span className="settings-modal__label">Tema</span>
                    <p className="settings-modal__sublabel">Cambia entre claro y oscuro</p>
                </div>
                </div>
                <div className="settings-modal__action">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                </div>
            </div>

          <hr className="settings-modal__divider" />

          <div className="settings-modal__row">
            <div className="settings-modal__info">
              <Globe size={18} className="settings-modal__icon" />
              <div>
                <span className="settings-modal__label">Idioma</span>
                <p className="settings-modal__sublabel">Selecciona tu idioma de preferencia</p>
              </div>
            </div>
            <div className="settings-modal__action">
              <LocaleSwitcher />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
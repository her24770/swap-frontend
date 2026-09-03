"use client";
import { X, SunMoon,  Globe, RotateCcw } from "lucide-react";
import { useTheme } from "../../../../context/Themecontext";
import { useAuthStore } from "../../../../store/authStore";
import { useRouter } from "../../../../i18n/routing";
import LocaleSwitcher from "../../../layout/Navbar/LocaleSwitcher/LocaleSwitcher";
import ThemeToggle from "../../../ui/Button/ThemeToggle/ThemeToggle";
import "../Modal.css";
import "./SettingsModal.css"; 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_PREFIX = "swap-onboarding-seen-";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const usuario = useAuthStore((state) => state.usuario);
  const router = useRouter();

  if (!isOpen) return null;

  // Fix MJ-01: no había ninguna forma de volver a ver el tutorial una vez
  // cerrado — solo se guardaba la marca en localStorage sin acción para
  // borrarla. Este botón la borra y navega a "/?tour=replay", que
  // TourBienvenida detecta para reactivarse aunque el usuario ya no sea
  // "recién registrado".
  function reiniciarTutorial() {
    if (!usuario) return;
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${usuario.id_usuario}`);
    } catch {
    }
    onClose();
    router.push("/?tour=replay");
  }

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

          {usuario && (
            <>
              <hr className="settings-modal__divider" />

              <div className="settings-modal__row">
                <div className="settings-modal__info">
                  <RotateCcw size={18} className="settings-modal__icon" />
                  <div>
                    <span className="settings-modal__label">Tutorial</span>
                    <p className="settings-modal__sublabel">Vuelve a ver la guía de bienvenida</p>
                  </div>
                </div>
                <div className="settings-modal__action">
                  <button
                    type="button"
                    className="settings-modal__button"
                    onClick={reiniciarTutorial}
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

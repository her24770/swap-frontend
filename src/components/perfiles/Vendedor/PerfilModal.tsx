import type { ReactNode } from "react";
import "../../ui/Modal/Modal.css";

interface PerfilModalProps {
  ariaLabel: string;
  onClose: () => void;
  children: ReactNode;
}

export default function PerfilModal({ ariaLabel, onClose, children }: PerfilModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="perfil-page__crear-pub-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div className="perfil-page__crear-pub-modal-content">{children}</div>
      </div>
    </div>
  );
}

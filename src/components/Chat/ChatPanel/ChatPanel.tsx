import { X } from "lucide-react";
import type { TipoPanel } from "../../../types/chat";
import "./ChatPanel.css";

interface ChatPanelProps {
  tipo: TipoPanel;
  onClose: () => void;
  children?: React.ReactNode;
}

const PANEL_TITLES: Record<NonNullable<TipoPanel>, string> = {
  acuerdo:   "Detalle del acuerdo",
  publicacion: "Publicación",
  opciones:    "Opciones",
};

export default function ChatPanel({ tipo, onClose, children }: ChatPanelProps) {
  if (!tipo) return null;

  return (
    <div className="chat-panel">
      <div className="chat-panel__head">
        <span className="chat-panel__title">{PANEL_TITLES[tipo]}</span>
        <button
          type="button"
          className="chat-panel__close"
          onClick={onClose}
          aria-label="Cerrar panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="chat-panel__body">
        {children}
      </div>
    </div>
  );
}
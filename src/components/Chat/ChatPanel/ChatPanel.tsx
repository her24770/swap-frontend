import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TipoPanel } from "../../../types/chat";
import "./ChatPanel.css";

interface ChatPanelProps {
  tipo: TipoPanel;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function ChatPanel({ tipo, onClose, children }: ChatPanelProps) {
  const t = useTranslations("chat.panel");
  if (!tipo) return null;

  const panelTitles: Record<NonNullable<TipoPanel>, string> = {
    acuerdo: t("titles.agreement"),
    publicacion: t("titles.post"),
    opciones: t("titles.options"),
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel__head">
        <span className="chat-panel__title">{panelTitles[tipo]}</span>
        <button
          type="button"
          className="chat-panel__close"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X size={16} />
        </button>
      </div>
      <div className="chat-panel__body">{children}</div>
    </div>
  );
}

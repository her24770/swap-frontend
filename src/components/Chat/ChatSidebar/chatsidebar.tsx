"use client";

import { UserCircle2 } from "lucide-react";
import type { ConversacionPreview, TabMensajes } from "../../../types/chat";
import "./chatsidebar.css";

interface ChatSidebarProps {
  conversaciones: ConversacionPreview[];
  selectedId: number | null;
  tab: TabMensajes;
  onTabChange: (tab: TabMensajes) => void;
  onSelect: (conv: ConversacionPreview) => void;
  onConfirmar?: (id: number) => void;
  onEliminar?: (id: number) => void;
}

const TABS: { key: TabMensajes; label: string }[] = [
  { key: "todas",   label: "Todas"   },
  { key: "ventas",  label: "Ventas"  },
  { key: "compras", label: "Compras" },
];

export default function ChatSidebar({
  conversaciones, selectedId, tab,
  onTabChange, onSelect, onConfirmar, onEliminar,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__head">
        <h1 className="chat-sidebar__title">Mensajes</h1>
        <p className="chat-sidebar__sub">Conversaciones activas</p>
      </div>

      <div className="chat-sidebar__tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`chat-sidebar__tab${tab === key ? " chat-sidebar__tab--active" : ""}`}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="chat-sidebar__list">
        {conversaciones.map((conv) => (
          <div
            key={conv.id_conversacion}
            className={`chat-sidebar__item${selectedId === conv.id_conversacion ? " chat-sidebar__item--active" : ""}`}
            onClick={() => onSelect(conv)}
            role="button"
            tabIndex={0}
          >
            <div className="chat-sidebar__avatar">
              {conv.avatarUrl
                ? <img src={conv.avatarUrl} alt={conv.nombre} className="chat-sidebar__avatar-img" />
                : <UserCircle2 size={22} strokeWidth={1.2} />
              }
            </div>
            <div className="chat-sidebar__info">
              <div className="chat-sidebar__top-row">
                <span className="chat-sidebar__name">{conv.nombre}</span>
                {conv.esSolicitud && (
                  <div className="chat-sidebar__btns">
                    <button
                      type="button"
                      className="chat-sidebar__btn chat-sidebar__btn--confirmar"
                      onClick={(e) => { e.stopPropagation(); onConfirmar?.(conv.id_conversacion); }}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="chat-sidebar__btn chat-sidebar__btn--eliminar"
                      onClick={(e) => { e.stopPropagation(); onEliminar?.(conv.id_conversacion); }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
              <span className="chat-sidebar__preview">{conv.preview}</span>
            </div>
            {conv.fecha_ultimo_mensaje && !conv.esSolicitud && (
              <span className="chat-sidebar__hora">{conv.fecha_ultimo_mensaje}</span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

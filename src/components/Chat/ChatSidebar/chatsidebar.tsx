"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserCircle2 } from "lucide-react";
import type { ConversacionPreview } from "../../../types/chat";
import AcuerdoPendienteBadge from "../../conversaciones/AcuerdoPendienteBadge/AcuerdoPendienteBadge";
import Image from "next/image";
import "./chatsidebar.css";
import SearchContactsBar from "../../ui/SearchContactsBar/SearchContactsBar";

const normalizeSearch = (value: string) =>
  value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

interface ChatSidebarProps {
  conversaciones: ConversacionPreview[];
  selectedId: number | null;
  onSelect: (conv: ConversacionPreview) => void;
  onConfirmar?: (id: number) => void;
  onEliminar?: (id: number) => void;
  /** id_conversacion -> cantidad de acuerdos pendientes de respuesta */
  acuerdosPendientesPorConversacion?: Record<number, number>;
}

export default function ChatSidebar({
  conversaciones, selectedId,
  onSelect, onConfirmar, onEliminar,
  acuerdosPendientesPorConversacion = {},
}: ChatSidebarProps) {
  const t = useTranslations("chat.sidebar");
  const [search, setSearch] = useState("");
  const query = normalizeSearch(search.trim());
  const filteredConversations = query
    ? conversaciones.filter(({ nombre, preview }) =>
        normalizeSearch(`${nombre} ${preview}`).includes(query))
    : conversaciones;

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar__head">
        <h1 className="chat-sidebar__title">{t("title")}</h1>
        <p className="chat-sidebar__sub">{t("subtitle")}</p>
      </div>

      <div className="chat-sidebar__list">
        <SearchContactsBar onSearch={setSearch} />

        {filteredConversations.map((conv) => (
          <div
            key={conv.id_conversacion}
            className={`chat-sidebar__item${selectedId === conv.id_conversacion ? " chat-sidebar__item--active" : ""}`}
            onClick={() => onSelect(conv)}
            role="button"
            tabIndex={0}
          >
            <div className="chat-sidebar__avatar">
              {conv.avatarUrl
                ? <Image src={conv.avatarUrl} alt={conv.nombre} width={40} height={40} className="chat-sidebar__avatar-img" />
                : <UserCircle2 size={22} strokeWidth={1.2} />
              }
            </div>
            <div className="chat-sidebar__info">
              <div className="chat-sidebar__top-row">
                <span className="chat-sidebar__name">{conv.nombre}</span>
                <div className="chat-sidebar__top-row-right">
                  <AcuerdoPendienteBadge
                    cantidad={acuerdosPendientesPorConversacion[conv.id_conversacion] ?? 0}
                  />
                  {conv.esSolicitud && (
                    <div className="chat-sidebar__btns">
                      <button
                        type="button"
                        className="chat-sidebar__btn chat-sidebar__btn--confirmar"
                        onClick={(e) => { e.stopPropagation(); onConfirmar?.(conv.id_conversacion); }}
                      >
                        {t("confirm")}
                      </button>
                      <button
                        type="button"
                        className="chat-sidebar__btn chat-sidebar__btn--eliminar"
                        onClick={(e) => { e.stopPropagation(); onEliminar?.(conv.id_conversacion); }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  )}
                </div>
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

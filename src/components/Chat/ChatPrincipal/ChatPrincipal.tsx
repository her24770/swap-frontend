"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, MapPin, MoreVertical, UserCircle2 } from "lucide-react";
import AcuerdoBanner from "./AcuerdoBanner/AcuerdoBanner";
import ChatPanel from "../ChatPanel/ChatPanel";
import ChatInput from "./ChatInput/ChatInput";
import MensajesBurbuja from "./MensajesBurbuja/MensajesBurbuja";
import { useAuthStore } from "../../../store/authStore";
import type { AcuerdoHistorial } from "../../../types/acuerdo";
import type { ConversacionPreview, Mensaje, TipoPanel } from "../../../types/chat";
import "./ChatPrincipal.css";

interface ChatprincipalProps {
  conversacion: ConversacionPreview;
  mensajes: Mensaje[];
  acuerdo?: AcuerdoHistorial | null;
  onEnviar: (texto: string) => void;
  onCrearEncuentro?: () => void;
  onVolver?: () => void;
}

export default function Chatprincipal({
  conversacion,
  mensajes,
  acuerdo,
  onEnviar,
  onCrearEncuentro,
  onVolver,
}: ChatprincipalProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [panel, setPanel] = useState<TipoPanel>(null);
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);

  return (
    <div className="chat-principal">
      <div className="chat-principal__header">
        <div className="chat-principal__header-left">
          {onVolver && (
            <button
              type="button"
              className="chat-principal__back-btn"
              aria-label="Volver a conversaciones"
              onClick={onVolver}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="chat-principal__avatar">
            {conversacion.avatarUrl
              ? <img src={conversacion.avatarUrl} alt={conversacion.nombre} />
              : <UserCircle2 size={22} strokeWidth={1.2} />
            }
          </div>
          <span className="chat-principal__name">{conversacion.nombre}</span>
        </div>

        <div className="chat-principal__menu">
          <button
            type="button"
            className="chat-principal__menu-btn"
            aria-label="Opciones"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((prev) => !prev)}
          >
            <MoreVertical size={18} />
          </button>
          {menuAbierto && (
            <div className="chat-principal__dropdown">
              <button
                type="button"
                className="chat-principal__dropdown-item"
                onClick={() => setMenuAbierto(false)}
              >
                Ver publicacion
              </button>
              <button
                type="button"
                className="chat-principal__dropdown-item"
                onClick={() => {
                  setMenuAbierto(false);
                  onCrearEncuentro?.();
                }}
              >
                Crear acuerdo
              </button>
              <button
                type="button"
                className="chat-principal__dropdown-item chat-principal__dropdown-item--danger"
                onClick={() => setMenuAbierto(false)}
              >
                Reportar
              </button>
            </div>
          )}
        </div>
      </div>

      <AcuerdoBanner
        acuerdo={acuerdo}
        onDetalles={() => setPanel(panel === "acuerdo" ? null : "acuerdo")}
        onCrear={onCrearEncuentro}
      />

      <div className="chat-principal__body">
        <MensajesBurbuja
          mensajes={mensajes}
          avatarUrl={conversacion.avatarUrl}
          idUsuarioActual={idUsuarioActual}
        />
        {panel === "acuerdo" && acuerdo && (
          <ChatPanel tipo="acuerdo" onClose={() => setPanel(null)}>
            <div className="chat-principal__acuerdo-detail">
              <h3 className="chat-principal__acuerdo-title">{acuerdo.publicacion.titulo}</h3>
              <p className="chat-principal__acuerdo-price">Q{acuerdo.publicacion.precio}</p>
              <div className="chat-principal__acuerdo-meta">
                <span>
                  <MapPin size={14} />
                  {acuerdo.lugar_entrega}
                </span>
                <span>
                  <Calendar size={14} />
                  {acuerdo.fecha_entrega}
                </span>
              </div>
              {acuerdo.observaciones && (
                <div className="chat-principal__acuerdo-notes">
                  <strong>Observaciones</strong>
                  <p>{acuerdo.observaciones}</p>
                </div>
              )}
            </div>
          </ChatPanel>
        )}
      </div>

      <ChatInput onEnviar={onEnviar} />
    </div>
  );
}

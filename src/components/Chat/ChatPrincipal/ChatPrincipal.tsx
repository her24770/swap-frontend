"use client";

import { useState } from "react";
import { UserCircle2, MoreVertical, ChevronLeft } from "lucide-react";
import AcuerdoBanner from "./AcuerdoBanner/AcuerdoBanner";
import MensajesBurbuja from "./MensajesBurbuja/MensajesBurbuja";
import ChatInput from "./ChatInput/ChatInput";
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
  conversacion, mensajes, acuerdo, onEnviar, onCrearEncuentro, onVolver,
}: ChatprincipalProps) {
  const [panel, setPanel] = useState<TipoPanel>(null);
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);

  return (
    <div className="chat-principal">

      {/* Header */}
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
        <button
          type="button"
          className="chat-principal__menu-btn"
          aria-label="Opciones"
          onClick={() => setPanel(panel === "opciones" ? null : "opciones")}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Banner acuerdo */}
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
      </div>

      {/* Input */}
      <ChatInput onEnviar={onEnviar} />
    </div>
  );
}

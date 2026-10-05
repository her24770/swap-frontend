"use client";

import { useEffect, useRef } from "react";
import { X, UserCircle2 } from "lucide-react";
import ChatInput from "../ChatPrincipal/ChatInput/ChatInput";
import MensajesBurbuja from "../ChatPrincipal/MensajesBurbuja/MensajesBurbuja";
import { useAuthStore } from "../../../store/authStore";
import { useMiniChatStore } from "../../../store/miniChatStore";
import type { Mensaje } from "../../../types/chat";
import "./MiniChatWidget.css";

interface MiniChatWidgetProps {
  idUsuario: number;
  nombre: string;
  avatarUrl?: string;
}

export default function MiniChatWidget({ idUsuario, nombre, avatarUrl }: MiniChatWidgetProps) {
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const conversacion = useMiniChatStore((state) => state.conversaciones[idUsuario]);
  const agregarMensaje = useMiniChatStore((state) => state.agregarMensaje);
  const setMinimizado = useMiniChatStore((state) => state.setMinimizado);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollable = bodyRef.current?.querySelector<HTMLDivElement>(".mensajes-burbuja");
    if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
  }, [conversacion?.mensajes.length, conversacion?.minimizado]);

  // No mostrar el widget para el propio perfil ni si no existe todavia una conversacion
  if (idUsuarioActual != null && idUsuarioActual === idUsuario) return null;
  if (!conversacion) return null;

  if (conversacion.minimizado) {
    return (
      <button
        type="button"
        className="mini-chat-widget__bar"
        onClick={() => setMinimizado(idUsuario, false)}
      >
        <span className="mini-chat-widget__bar-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={nombre} /> : <UserCircle2 size={18} strokeWidth={1.2} />}
        </span>
        <span className="mini-chat-widget__bar-name">{nombre}</span>
      </button>
    );
  }

  const handleEnviar = (texto: string) => {
    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: idUsuario,
      id_emisor: idUsuarioActual ?? 0,
      mensaje: texto,
      estado_mensaje: 1,
      fecha_enviado: new Date().toISOString(),
    };
    agregarMensaje(idUsuario, { nombre, avatarUrl }, nuevoMensaje);
  };

  return (
    <div className="mini-chat-widget">
      <div className="mini-chat-widget__header">
        <span className="mini-chat-widget__header-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={nombre} /> : <UserCircle2 size={18} strokeWidth={1.2} />}
        </span>
        <span className="mini-chat-widget__header-name">{nombre}</span>
        <button
          type="button"
          className="mini-chat-widget__close"
          aria-label="Cerrar chat"
          onClick={() => setMinimizado(idUsuario, true)}
        >
          <X size={16} />
        </button>
      </div>

      <div className="mini-chat-widget__body" ref={bodyRef}>
        <MensajesBurbuja
          mensajes={conversacion.mensajes}
          avatarUrl={avatarUrl}
          idUsuarioActual={idUsuarioActual}
        />
      </div>

      <ChatInput onEnviar={handleEnviar} />
    </div>
  );
}

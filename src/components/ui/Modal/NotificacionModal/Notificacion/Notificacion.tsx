"use client";

import {X, MessageCircle, Heart, Bookmark, Bell, Handshake } from "lucide-react";
import "./Notificaciones.css";

export type TipoNotificacion = "mensaje" | "like" | "guardado" | "sistema" | "oferta";

export interface NotificacionData {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
}

interface NotificacionProps {
  notificacion: NotificacionData;
  onDismiss: (id: number) => void;
  onMarcarLeida?: (id: number) => void;
}

const TIPO_ICONS: Record<TipoNotificacion, React.ReactNode> = {
  mensaje: <MessageCircle size={18} strokeWidth={2} />,
  like: <Heart size={18} strokeWidth={2} />,
  guardado: <Bookmark size={18} strokeWidth={2} />,
  sistema: <Bell size={18} strokeWidth={2} />,
  oferta: <Handshake size={18} strokeWidth={2} />,
};

export default function Notificacion({
  notificacion,
  onDismiss,
  onMarcarLeida,
}: NotificacionProps) {
  const { id, tipo, titulo, descripcion, fecha, leida, } = notificacion;

  return (
    <div
      className={`notificacion${leida ? "" : " notificacion--unread"}`}
      onClick={() => !leida && onMarcarLeida?.(id)}
      role={leida ? undefined : "button"}
      tabIndex={leida ? undefined : 0}
      onKeyDown={(e) => {
        if (!leida && (e.key === "Enter" || e.key === " ")) onMarcarLeida?.(id);
      }}
    >
      {/* Dot de no leída */}
      {!leida && <span className="notificacion__dot" aria-label="No leída" />}

      <div className="notificacion__avatar">
        <span className="notificacion__avatar-icon" aria-hidden>
          {TIPO_ICONS[tipo]}
        </span>
      </div>

      {/* Contenido */}
      <div className="notificacion__body">
        <p className="notificacion__titulo">{titulo}</p>
        <p className="notificacion__descripcion">{descripcion}</p>
        <span className="notificacion__fecha">{fecha}</span>
      </div>

      <button
        type="button"
        className="notificacion__dismiss"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
        aria-label="Descartar notificación"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
"use client";

import { useState, type ButtonHTMLAttributes, type ElementType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  UserCircle2,
  X,
  Loader2,
} from "lucide-react";
import "./TutoriaNotificacion.css";

export interface SolicitudTutoriaNotificacion {
  id: number;
  alumno: string;
  fecha: string;
  hora: string;
  lugar: string;
  tema: string;
  tutoria?: string;
  avatarUrl?: string | null;
  tipoPerfil?: string;
  id_conversacion?: number;
}

interface TarjetaNotificacionSolicitudProps {
  solicitud: SolicitudTutoriaNotificacion;
  onAceptar?: (id: number) => Promise<void> | void;
  onRechazar?: (id: number) => Promise<void> | void;
}

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ElementType;
  variant: "accept" | "reject";
  children: ReactNode;
}

interface DetailItemProps {
  icon: ElementType;
  label: string;
  value: string;
  className?: string;
}

function ActionButton({ icon: Icon, variant, children, className = "", ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`tutoria-notificacion__button tutoria-notificacion__button--${variant} ${className}`.trim()}
      {...props}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function DetailItem({ icon: Icon, label, value, className = "" }: DetailItemProps) {
  return (
    <div className={className}>
      <dt>
        <Icon size={15} /> {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function TarjetaNotificacionSolicitud({
  solicitud,
  onAceptar,
  onRechazar,
}: TarjetaNotificacionSolicitudProps) {
  const t = useTranslations("tutorias");
  const [procesando, setProcesando] = useState<"aceptar" | "rechazar" | null>(null);

  const handleAceptar = async () => {
    if (!onAceptar || procesando) return;
    setProcesando("aceptar");
    try {
      await onAceptar(solicitud.id);
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async () => {
    if (!onRechazar || procesando) return;
    setProcesando("rechazar");
    try {
      await onRechazar(solicitud.id);
    } finally {
      setProcesando(null);
    }
  };

  // Cabecera dinámica: si es tutoría muestra "SOLICITUD DE TUTORÍA", o el tipo correspondiente
  const headerText = solicitud.tipoPerfil
    ? `SOLICITUD DE ${solicitud.tipoPerfil.toUpperCase()}`
    : t("solicitud");

  return (
    <article className="tutoria-notificacion">
      <header className="tutoria-notificacion__header">
        <span className="tutoria-notificacion__avatar" aria-hidden="true">
          {solicitud.avatarUrl ? (
            <img
              src={solicitud.avatarUrl}
              alt={solicitud.alumno}
              className="tutoria-notificacion__avatar-img"
            />
          ) : (
            <UserCircle2 size={24} />
          )}
        </span>
        <div>
          <p className="tutoria-notificacion__eyebrow">{headerText}</p>
          <h3>{solicitud.alumno}</h3>
          {solicitud.tutoria && <p>{solicitud.tutoria}</p>}
        </div>
      </header>

      <dl className="tutoria-notificacion__details">
        <DetailItem 
          icon={CalendarDays} 
          label={t("fecha")} 
          value={solicitud.fecha} 
        />
        <DetailItem 
          icon={Clock3} 
          label={t("hora")} 
          value={solicitud.hora} 
        />
        <DetailItem 
          icon={MapPin} 
          label={t("lugar")} 
          value={solicitud.lugar} 
        />
        <DetailItem
          icon={BookOpen}
          label={t("tema")}
          value={solicitud.tema}
          className="tutoria-notificacion__topic"
        />
      </dl>

      <footer className="tutoria-notificacion__actions">
        <ActionButton
          icon={procesando === "rechazar" ? Loader2 : X}
          variant="reject"
          onClick={handleRechazar}
          disabled={!onRechazar || procesando !== null}
        >
          {t("rechazar")}
        </ActionButton>
        <ActionButton
          icon={procesando === "aceptar" ? Loader2 : Check}
          variant="accept"
          onClick={handleAceptar}
          disabled={!onAceptar || procesando !== null}
        >
          {t("aceptar")}
        </ActionButton>
      </footer>
    </article>
  );
}
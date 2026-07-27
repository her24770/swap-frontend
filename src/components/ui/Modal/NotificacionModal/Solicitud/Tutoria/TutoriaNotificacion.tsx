"use client";

import type { ButtonHTMLAttributes, ElementType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  UserCircle2,
  X,
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
}

interface TarjetaNotificacionSolicitudProps {
  solicitud: SolicitudTutoriaNotificacion;
  onAceptar?: (id: number) => void;
  onRechazar?: (id: number) => void;
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

  return (
    <article className="tutoria-notificacion">
      <header className="tutoria-notificacion__header">
        <span className="tutoria-notificacion__avatar" aria-hidden="true">
          <UserCircle2 size={24} />
        </span>
        <div>
          <p className="tutoria-notificacion__eyebrow">{t("solicitud")}</p>
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
          icon={X}
          variant="reject"
          onClick={() => onRechazar?.(solicitud.id)}
          disabled={!onRechazar}
        >
          {t("rechazar")}
        </ActionButton>
        <ActionButton
          icon={Check}
          variant="accept"
          onClick={() => onAceptar?.(solicitud.id)}
          disabled={!onAceptar}
        >
          {t("aceptar")}
        </ActionButton>
      </footer>
    </article>
  );
}
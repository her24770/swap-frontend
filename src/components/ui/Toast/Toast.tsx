"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUIStore } from "../../../store/uiStore";
import "./Toast.css";

const DURATION = 4000;

const ICONS = {
  success: <CheckCircle2 size={16} strokeWidth={2.5} />,
  error:   <XCircle     size={16} strokeWidth={2.5} />,
  info:    <Info        size={16} strokeWidth={2.5} />,
  warning: <AlertTriangle size={16} strokeWidth={2.5} />,
};

interface ToastItemProps {
  id: string;
  tipo: "success" | "error" | "info" | "warning";
  titulo?: string;
  mensaje: string;
  duracion?: number;
  onRemove: (id: string) => void;
}

function ToastItem({ id, tipo, titulo, mensaje, duracion = DURATION, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const t = useTranslations("toast");

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(id), 280);
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duracion);
    return () => clearTimeout(timer);
  }, [dismiss, duracion]);

  return (
    <div
      className={`toast toast--${tipo}${exiting ? " toast--exiting" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">{ICONS[tipo]}</div>

      <div className="toast__body">
        <p className="toast__title">{titulo ?? t(`titles.${tipo}`)}</p>
        {mensaje && <p className="toast__message">{mensaje}</p>}
      </div>

      <button
        type="button"
        className="toast__close"
        onClick={dismiss}
        aria-label={t("closeAria")}
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      <div
        className="toast__progress"
        style={{ animationDuration: `${duracion}ms` }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const { notificaciones, eliminarNotificacion } = useUIStore();
  const t = useTranslations("toast");

  return (
    <div className="toast-container" role="region" aria-label={t("containerAria")}>
      {notificaciones.map((n) => (
        <ToastItem
          key={n.id}
          id={n.id}
          tipo={n.tipo}
          titulo={n.titulo}
          mensaje={n.mensaje}
          duracion={n.duracion}
          onRemove={eliminarNotificacion}
        />
      ))}
    </div>
  );
}

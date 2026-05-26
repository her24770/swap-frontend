"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, CheckCheck } from "lucide-react";
import Notificacion from "./Notificacion/Notificacion";
import type { NotificacionData } from "./Notificacion/Notificacion";
import "./NotificacionModal.css";

interface NotificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  notificaciones: NotificacionData[];
  onDismiss: (id: number) => void;
  onMarcarTodasLeidas?: () => void;
  onMarcarLeida?: (id: number) => void;
}

type PanelPosition = {
  top: number;
  right: number;
};

export default function NotificacionModal({
  isOpen,
  onClose,
  anchorRef,
  notificaciones,
  onDismiss,
  onMarcarTodasLeidas,
  onMarcarLeida,
}: NotificacionModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<PanelPosition>({ top: 0, right: 16 });

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) {
      setPosition({ top: 56, right: 16 });
      return;
    }

    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    }, 0);

    document.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !mounted) return null;

  const panel = (
    <div
      ref={panelRef}
      className="notif-modal notif-modal--anchored"
      style={{ top: position.top, right: position.right }}
      role="dialog"
      aria-label="Notificaciones"
      aria-modal="true"
    >
      <div className="notif-modal__header">
        <h2 className="notif-modal__title">Notificaciones</h2>
        <div className="notif-modal__header-actions">
          {noLeidas > 0 && onMarcarTodasLeidas && (
            <button
              type="button"
              className="notif-modal__mark-all"
              onClick={onMarcarTodasLeidas}
              title="Marcar todas como leídas"
            >
              <CheckCheck size={16} strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            className="notif-modal__close"
            onClick={onClose}
            aria-label="Cerrar notificaciones"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {noLeidas > 0 && (
        <p className="notif-modal__unread-count">{noLeidas} sin leer</p>
      )}

      <div className="notif-modal__body">
        {notificaciones.length === 0 ? (
          <div className="notif-modal__empty">
            <Bell size={56} strokeWidth={1} className="notif-modal__empty-icon" />
            <p className="notif-modal__empty-title">Aquí encontrarás tus notificaciones</p>
          </div>
        ) : (
          <div className="notif-modal__list">
            {notificaciones.map((n) => (
              <Notificacion
                key={n.id}
                notificacion={n}
                onDismiss={onDismiss}
                onMarcarLeida={onMarcarLeida}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

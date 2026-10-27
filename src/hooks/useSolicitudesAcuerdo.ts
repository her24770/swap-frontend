"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSocket } from "./useSocket";
import { useToast } from "./useToast";
import { useAuthStore } from "../store/authStore";
import { acuerdoService, mapAcuerdoToSolicitud } from "../services/acuerdoService";
import type { SolicitudTutoriaNotificacion } from "../components/ui/Modal/NotificacionModal/Solicitud/Tutoria/TutoriaNotificacion";

interface UseSolicitudesAcuerdoOptions {
  isOpen?: boolean;
}

/**
 * Hook para consultar y sincronizar en tiempo real las solicitudes de acuerdos recibidas
 * por el usuario autenticado (escuchando el evento socket "acuerdo:actualizado").
 */
export function useSolicitudesAcuerdo({ isOpen = false }: UseSolicitudesAcuerdoOptions = {}) {
  const [solicitudes, setSolicitudes] = useState<SolicitudTutoriaNotificacion[]>([]);
  const socket = useSocket();
  const t = useTranslations("tutorias");
  const toast = useToast();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);

  const [idPrevio, setIdPrevio] = useState(idUsuarioActual);

  // Al cerrar sesión se vacían las solicitudes (durante el render, sin efecto)
  if (idPrevio !== idUsuarioActual) {
    setIdPrevio(idUsuarioActual);
    if (!idUsuarioActual) setSolicitudes([]);
  }

  // Carga inicial y actualización al abrir el modal de notificaciones
  useEffect(() => {
    if (!idUsuarioActual) return;

    acuerdoService
      .getSolicitudesPendientesUsuario(idUsuarioActual)
      .then(setSolicitudes)
      .catch(() => {});
  }, [idUsuarioActual, isOpen]);

  // Escucha del evento "acuerdo:actualizado" para sincronización en tiempo real
  useEffect(() => {
    async function alActualizarAcuerdo(payload: { id_conversacion?: number }) {
      const idConversacion = Number(payload?.id_conversacion);
      if (!Number.isInteger(idConversacion) || idConversacion <= 0) return;

      try {
        const acuerdos = await acuerdoService.getPorConversacion(idConversacion);
        const idActual = useAuthStore.getState().usuario?.id_usuario;

        const solicitudesActualizadas = (Array.isArray(acuerdos) ? acuerdos : [])
          .filter((a) => {
            const esPendiente = a.estadoRel?.estado === "pendiente";
            const esEntrante = idActual ? a.id_ofertante !== idActual : true;
            return esPendiente && esEntrante;
          })
          .map(mapAcuerdoToSolicitud);

        setSolicitudes((prev) => {
          const filtradas = prev.filter((s) => s.id_conversacion !== idConversacion);
          return [...solicitudesActualizadas, ...filtradas];
        });
      } catch {
        // Sincronización en segundo plano: la próxima carga o evento la reintenta.
      }
    }

    socket.on("acuerdo:actualizado", alActualizarAcuerdo);
    return () => {
      socket.off("acuerdo:actualizado", alActualizarAcuerdo);
    };
  }, [socket]);

  // Aceptar solicitud de acuerdo y actualizar estado local
  const aceptarSolicitud = useCallback(async (idAcuerdo: number) => {
    try {
      await acuerdoService.actualizarEstado(idAcuerdo, "activo");
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud.id !== idAcuerdo));
    } catch {
      toast.error(t("errorAccion"));
    }
  }, [toast, t]);

  // Rechazar solicitud de acuerdo y actualizar estado local
  const rechazarSolicitud = useCallback(async (idAcuerdo: number) => {
    try {
      await acuerdoService.actualizarEstado(idAcuerdo, "cancelado");
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud.id !== idAcuerdo));
    } catch {
      toast.error(t("errorAccion"));
    }
  }, [toast, t]);

  return {
    solicitudes,
    aceptarSolicitud,
    rechazarSolicitud,
  };
}

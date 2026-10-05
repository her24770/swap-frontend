"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
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
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);

  // Carga inicial y actualización al abrir el modal de notificaciones
  useEffect(() => {
    if (!idUsuarioActual) {
      setSolicitudes([]);
      return;
    }

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
      } catch (error) {
        console.error("Error al sincronizar acuerdos por socket:", error);
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
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
      throw err;
    }
  }, []);

  // Rechazar solicitud de acuerdo y actualizar estado local
  const rechazarSolicitud = useCallback(async (idAcuerdo: number) => {
    try {
      await acuerdoService.actualizarEstado(idAcuerdo, "cancelado");
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud.id !== idAcuerdo));
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
      throw err;
    }
  }, []);

  return {
    solicitudes,
    aceptarSolicitud,
    rechazarSolicitud,
  };
}

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { conversacionService } from "../services/conversacionService";
import { useSocket, unirseAConversacion, enviarMensajePorSocket } from "./useSocket";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import type { ConversacionPreview, Mensaje } from "../types/chat";

const obtenerFechaHoraActual = () => {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  const hour = String(ahora.getHours()).padStart(2, "0");
  const minute = String(ahora.getMinutes()).padStart(2, "0");
  const second = String(ahora.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

// Historial de mensajes de las conversaciones: carga el de la conversacion
// seleccionada, se une a su sala de socket y mantiene el estado al recibir
// "mensaje:nuevo".
export function useMensajesChat(
  selected: ConversacionPreview | null,
  setConversacionesState: Dispatch<SetStateAction<ConversacionPreview[]>>
) {
  const t = useTranslations("chat");
  const { agregarNotificacion } = useUIStore();
  const idUsuarioActual = useAuthStore((state) => state.usuario?.id_usuario);
  const socket = useSocket();
  const [mensajesPorConversacion, setMensajesPorConversacion] =
    useState<Record<number, Mensaje[]>>({});

  const idSeleccionada = selected?.id_conversacion;
  const estadoSeleccionada = selected?.estado_conversacion;

  useEffect(() => {
    if (idSeleccionada === undefined) return;

    let cancelado = false;

    conversacionService
      .obtenerMensajes(idSeleccionada)
      .then((mensajesConversacion) => {
        if (cancelado) return;

        setMensajesPorConversacion((prev) => ({
          ...prev,
          [idSeleccionada]: mensajesConversacion,
        }));
      })
      .catch(() => {});

    const unirse = () => {
      unirseAConversacion(
        socket,
        idSeleccionada
      ).catch(() => {});
    };

    unirse();

    socket.on("connect", unirse);

    return () => {
      cancelado = true;
      socket.off("connect", unirse);
    };
    // estadoSeleccionada fuerza volver a unirse a la sala cuando cambia el estado.
  }, [idSeleccionada, estadoSeleccionada, socket]);

  // El propio emisor también recibe "mensaje:nuevo", así que no hay append local optimista.
  useEffect(() => {
    function alRecibirMensaje(mensajeNuevo: Mensaje) {
      setMensajesPorConversacion((prev) => {
        const actuales = prev[mensajeNuevo.id_conversacion] ?? [];
        if (actuales.some((m) => m.id_mensaje === mensajeNuevo.id_mensaje)) return prev;
        return {
          ...prev,
          [mensajeNuevo.id_conversacion]: [...actuales, mensajeNuevo],
        };
      });
      setConversacionesState((prev) => prev.map((conversacion) => (
        conversacion.id_conversacion === mensajeNuevo.id_conversacion
          ? {
            ...conversacion,
            preview: mensajeNuevo.mensaje,
            fecha_ultimo_mensaje: new Date(mensajeNuevo.fecha_enviado).toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
          : conversacion
      )));
    }

    socket.on("mensaje:nuevo", alRecibirMensaje);
    return () => {
      socket.off("mensaje:nuevo", alRecibirMensaje);
    };
  }, [socket, setConversacionesState]);

  const mensajes = selected
    ? mensajesPorConversacion[selected.id_conversacion] ?? []
    : [];

  // El estado se actualiza con el "mensaje:nuevo" que devuelve el backend.
  const handleEnviar = async (texto: string) => {
    if (!selected || !idUsuarioActual) return;

    const respuesta = await enviarMensajePorSocket(socket, selected.id_conversacion, texto);
    if (!respuesta.success) {
      agregarNotificacion({
        tipo: "error",
        mensaje: respuesta.message ?? t("system.agreementActionError"),
      });
    }
  };

  const handleEnviarImagen = (archivo: File) => {
    if (!selected || !idUsuarioActual) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: Date.now(),
      id_conversacion: selected.id_conversacion,
      id_emisor: idUsuarioActual,
      mensaje: `${t("system.attachedImageMessage")} ${archivo.name}`,
      estado_mensaje: 1,
      fecha_enviado: obtenerFechaHoraActual(),
    };

    setMensajesPorConversacion((prev) => ({
      ...prev,
      [selected.id_conversacion]: [...(prev[selected.id_conversacion] ?? []), nuevoMensaje],
    }));
    setConversacionesState((prev) => prev.map((conversacion) => (
      conversacion.id_conversacion === selected.id_conversacion
        ? {
          ...conversacion,
          preview: `${t("system.imagePreview")} ${archivo.name}`,
          fecha_ultimo_mensaje: nuevoMensaje.fecha_enviado,
        }
        : conversacion
    )));
  };

  const eliminarMensajesDe = (idConversacion: number) => {
    setMensajesPorConversacion((prev) => {
      const actualizado = { ...prev };
      delete actualizado[idConversacion];
      return actualizado;
    });
  };

  return { mensajes, handleEnviar, handleEnviarImagen, eliminarMensajesDe };
}

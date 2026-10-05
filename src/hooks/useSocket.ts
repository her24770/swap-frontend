"use client";

import { useRef } from "react";
import type { Socket } from "socket.io-client";
import { conectarSocket } from "../lib/socketClient";

export interface AckRespuesta<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Devuelve el socket compartido de la app (conecta una sola vez, ver socketClient.ts).
 * No desconecta en el unmount porque el mismo socket lo usan varios componentes
 * a la vez (chat y notificaciones); quien escuche eventos debe limpiar sus propios
 * listeners con socket.off(...) en su cleanup.
 */
export function useSocket(): Socket {
  const socketRef = useRef<Socket | null>(null);
  if (!socketRef.current) {
    socketRef.current = conectarSocket();
  }
  return socketRef.current;
}

/** Emite "conversacion:unirse" y espera el ack del backend (ver socketServer.ts). */
export function unirseAConversacion(socket: Socket, idConversacion: number): Promise<AckRespuesta> {
  return new Promise((resolve) => {
    socket.emit("conversacion:unirse", idConversacion, (respuesta: AckRespuesta) => {
      resolve(respuesta);
    });
  });
}

/** Emite "mensaje:enviar" y espera el ack del backend (ver socketServer.ts). */
export function enviarMensajePorSocket(
  socket: Socket,
  idConversacion: number,
  mensaje: string
): Promise<AckRespuesta> {
  return new Promise((resolve) => {
    socket.emit("mensaje:enviar", { id_conversacion: idConversacion, mensaje }, (respuesta: AckRespuesta) => {
      resolve(respuesta);
    });
  });
}

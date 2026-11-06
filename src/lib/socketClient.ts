import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

// Singleton: un solo socket compartido por toda la app (chat + notificaciones).
// La cookie httpOnly "swap-token" viaja automaticamente gracias a withCredentials,
// el backend la valida en el handshake (ver socketServer.ts).
let socket: Socket | null = null;
// Usuario con el que se autenticó el handshake actual del socket.
let idUsuarioConectado: number | null = null;
let suscrito = false;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

export function conectarSocket(): Socket {
  if (socket) return socket;

  idUsuarioConectado = useAuthStore.getState().usuario?.id_usuario ?? null;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  // El socket se crea al montar el Navbar, normalmente antes de iniciar sesion, por lo
  // que su handshake no llevaria la cookie del usuario y los mensajes no se enviarian
  // hasta recargar. Al cambiar de usuario se reconecta la misma instancia (conserva
  // los listeners) para que el handshake vaya con la sesion actual.
  if (!suscrito) {
    suscrito = true;
    useAuthStore.subscribe((state) => {
      const idActual = state.usuario?.id_usuario ?? null;
      if (!socket || idActual === idUsuarioConectado) return;
      idUsuarioConectado = idActual;
      socket.disconnect();
      if (idActual !== null) socket.connect();
    });
  }

  return socket;
}

export function obtenerSocket(): Socket | null {
  return socket;
}

export function desconectarSocket(): void {
  socket?.disconnect();
  socket = null;
}

import { io, Socket } from "socket.io-client";

// Singleton: un solo socket compartido por toda la app (chat + notificaciones).
// La cookie httpOnly "swap-token" viaja automaticamente gracias a withCredentials,
// el backend la valida en el handshake (ver socketServer.ts).
let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

export function conectarSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
}

export function obtenerSocket(): Socket | null {
  return socket;
}

export function desconectarSocket(): void {
  socket?.disconnect();
  socket = null;
}

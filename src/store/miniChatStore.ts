import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mensaje } from "../types/chat";

export interface MiniChatConversacion {
  idUsuario: number;
  nombre: string;
  avatarUrl?: string;
  mensajes: Mensaje[];
  minimizado: boolean;
}

interface MiniChatState {
  conversaciones: Record<number, MiniChatConversacion>;
  agregarMensaje: (
    idUsuario: number,
    info: { nombre: string; avatarUrl?: string },
    mensaje: Mensaje
  ) => void;
  setMinimizado: (idUsuario: number, minimizado: boolean) => void;
}

// Simula localmente la conversacion con otro usuario Persiste en localStorage para que el
// mini-chat del perfil recuerde con quien "ya hay conversacion" entre visitas.
export const useMiniChatStore = create<MiniChatState>()(
  persist(
    (set) => ({
      conversaciones: {},

      agregarMensaje: (idUsuario, info, mensaje) => {
        set((state) => {
          const existente = state.conversaciones[idUsuario];
          return {
            conversaciones: {
              ...state.conversaciones,
              [idUsuario]: {
                idUsuario,
                nombre: info.nombre,
                avatarUrl: info.avatarUrl,
                mensajes: [...(existente?.mensajes ?? []), mensaje],
                minimizado: existente?.minimizado ?? false,
              },
            },
          };
        });
      },

      setMinimizado: (idUsuario, minimizado) => {
        set((state) => {
          const existente = state.conversaciones[idUsuario];
          if (!existente) return state;
          return {
            conversaciones: {
              ...state.conversaciones,
              [idUsuario]: { ...existente, minimizado },
            },
          };
        });
      },
    }),
    {
      name: "swap-minichat",
    }
  )
);

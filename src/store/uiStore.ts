import { create } from "zustand";

// Estructura de una notificación temporal en pantalla
export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: "exito" | "error" | "info";
}

// Estado y acciones para estados globales de carga y notificaciones
interface UIState {
  cargando: boolean;
  notificaciones: Notificacion[];
  setCargando: (valor: boolean) => void;
  agregarNotificacion: (notificacion: Notificacion) => void;
  eliminarNotificacion: (id: string) => void;
}

// Store sin persistencia — carga y notificaciones son estados temporales
export const useUIStore = create<UIState>()((set) => ({
  cargando: false,
  notificaciones: [],

  setCargando: (valor) => set({ cargando: valor }),

  agregarNotificacion: (notificacion) =>
    set((state) => ({
      notificaciones: [...state.notificaciones, notificacion],
    })),

  eliminarNotificacion: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.filter((n) => n.id !== id),
    })),
}));

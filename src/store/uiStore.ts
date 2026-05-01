import { create } from "zustand";
export type ToastTipo = "success" | "error" | "info" | "warning";

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: ToastTipo;
  titulo?: string;
  duracion?: number;
}

// Estado y acciones para estados globales de carga y notificaciones
interface UIState {
  cargando: boolean;
  notificaciones: Notificacion[];
  setCargando: (valor: boolean) => void;
  agregarNotificacion: (n: Omit<Notificacion, "id">) => void;
  eliminarNotificacion: (id: string) => void;
}

// Store sin persistencia — carga y notificaciones son estados temporales
export const useUIStore = create<UIState>()((set) => ({
  cargando: false,
  notificaciones: [],

  setCargando: (valor) => set({ cargando: valor }),

  agregarNotificacion: (n) =>
    set((state) => ({
      notificaciones: [
        ...state.notificaciones,
        { ...n, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),

  eliminarNotificacion: (id) =>
    set((state) => ({
      notificaciones: state.notificaciones.filter((n) => n.id !== id),
    })),
}));

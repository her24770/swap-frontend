import { create } from "zustand";
export type ToastTipo = "success" | "error" | "info" | "warning";

export interface Notificacion {
  id: string;
  mensaje: string;
  tipo: ToastTipo;
  titulo?: string;
  duracion?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
}

interface UIState {
  cargando: boolean;
  notificaciones: Notificacion[];
  confirm: ConfirmDialogState;
  setCargando: (valor: boolean) => void;
  agregarNotificacion: (n: Omit<Notificacion, "id">) => void;
  eliminarNotificacion: (id: string) => void;
  mostrarConfirm: (opts: { titulo: string; mensaje: string; onConfirm: () => void }) => void;
  cerrarConfirm: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cargando: false,
  notificaciones: [],
  confirm: { isOpen: false, titulo: "", mensaje: "", onConfirm: () => {} },

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

  mostrarConfirm: ({ titulo, mensaje, onConfirm }) =>
    set({ confirm: { isOpen: true, titulo, mensaje, onConfirm } }),

  cerrarConfirm: () =>
    set({ confirm: { isOpen: false, titulo: "", mensaje: "", onConfirm: () => {} } }),
}));

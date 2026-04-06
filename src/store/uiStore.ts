import { create } from "zustand";

interface UIState {
  cargando: boolean;
  setCargando: (valor: boolean) => void;
}

export const useUIStore = create<UIState>()(() => ({
  cargando: false,
  setCargando: () => { throw new Error("Not implemented"); },
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rol, Usuario } from "../types/usuario";

export type { Rol, Usuario };

interface AuthState {
  usuario: Usuario | null;
  rol: Rol | null;
  login: (usuario: Usuario, rol: Rol) => void;
  logout: () => void;
}

// Solo persiste datos de display (nombre, foto, rol) — el token vive en cookie HttpOnly
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      rol: null,

      login: (usuario, rol) => {
        set({ usuario, rol });
      },

      logout: () => {
        set({ usuario: null, rol: null });
      },
    }),
    {
      name: "swap-auth",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rol, Usuario } from "../types/usuario";

export type { Rol, Usuario };

// Estado y acciones del store de autenticación
interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  rol: Rol | null;
  login: (usuario: Usuario, token: string, rol: Rol) => void;
  logout: () => void;
}

// Store persistido en localStorage bajo la clave "swap-auth"
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      rol: null,

      login: (usuario, token, rol) => {
        set({ usuario, token, rol });
        // Guarda el token en cookie para que el middleware del servidor pueda leerlo
        document.cookie = `swap-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      },

      logout: () => {
        set({ usuario: null, token: null, rol: null });
        // Elimina la cookie de sesión
        document.cookie = "swap-token=; path=/; max-age=0";
      },
    }),
    {
      name: "swap-auth",
    }
  )
);

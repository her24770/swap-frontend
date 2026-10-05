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

const AUTH_STORAGE_VERSION = 1;

type PersistedAuthState = {
  usuario: Pick<Usuario, "id_usuario" | "nombre" | "url_foto_perfil" | "descripcion" | "calificacion"> | null;
  rol: Rol | null;
};

function sanitizePersistedAuthState(persistedState: unknown): PersistedAuthState {
  const state = persistedState && typeof persistedState === "object"
    ? persistedState as { usuario?: Partial<Usuario> | null; rol?: unknown }
    : {};
  const usuario = state.usuario;

  return {
    usuario: usuario && typeof usuario.id_usuario === "number" && typeof usuario.nombre === "string"
      ? {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          url_foto_perfil: typeof usuario.url_foto_perfil === "string" ? usuario.url_foto_perfil : "",
          descripcion: typeof usuario.descripcion === "string" ? usuario.descripcion : null,
          calificacion: typeof usuario.calificacion === "number" ? usuario.calificacion : null,
        }
      : null,
    rol: state.rol === "usuario" || state.rol === "moderador" ? state.rol : null,
  };
}

// Fix BG-21: el comentario decía "solo persiste datos de display" pero no
// había ningún `partialize` haciéndolo cumplir — el objeto `Usuario`
// completo (incluyendo carnet y email_institucional, la misma info sensible
// de BG-17) se guardaba tal cual en localStorage, legible por cualquier
// script que corra en la página. Ahora sí se filtra explícitamente a solo
// lo que la UI necesita para pintar el header/navbar antes de que llegue la
// respuesta fresca de /me.
export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
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
      version: AUTH_STORAGE_VERSION,
      partialize: sanitizePersistedAuthState,
      // Los estados creados antes de BG-21 no tenían versión y podían incluir
      // el Usuario completo. Zustand ejecuta esta migración al hidratarlos y
      // vuelve a escribir localStorage únicamente con la proyección segura.
      migrate: (persistedState) => sanitizePersistedAuthState(persistedState),
    }
  )
);

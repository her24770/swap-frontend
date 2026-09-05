import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Moderador } from "../types/moderador";

interface ModeradorAuthState {
  moderador: Moderador | null;
  login: (moderador: Moderador) => void;
  logout: () => void;
}

const MODERADOR_AUTH_STORAGE_VERSION = 1;

type PersistedModeradorAuthState = {
  moderador: Pick<Moderador, "id_moderador" | "usuario" | "nivel"> | null;
};

function sanitizePersistedModeradorState(persistedState: unknown): PersistedModeradorAuthState {
  const state = persistedState && typeof persistedState === "object"
    ? persistedState as { moderador?: Partial<Moderador> | null }
    : {};
  const moderador = state.moderador;

  return {
    moderador: moderador &&
      typeof moderador.id_moderador === "number" &&
      typeof moderador.usuario === "string" &&
      (moderador.nivel === "moderador" || moderador.nivel === "superadmin")
      ? {
          id_moderador: moderador.id_moderador,
          usuario: moderador.usuario,
          nivel: moderador.nivel,
        }
      : null,
  };
}

// Fix BG-21: mismo patrón que useAuthStore — el tipo Moderador hoy no trae
// campos sensibles, pero se deja `partialize` explícito para que cualquier
// campo que se agregue después necesite un opt-in consciente en vez de
// persistirse por defecto.
export const useModeradorAuthStore = create<ModeradorAuthState>()(
  persist<ModeradorAuthState, [], [], PersistedModeradorAuthState>(
    (set) => ({
      moderador: null,

      login: (moderador) => {
        set({ moderador });
      },

      logout: () => {
        set({ moderador: null });
      },
    }),
    {
      name: "swap-moderador-auth",
      version: MODERADOR_AUTH_STORAGE_VERSION,
      partialize: sanitizePersistedModeradorState,
      migrate: (persistedState) => sanitizePersistedModeradorState(persistedState),
    }
  )
);

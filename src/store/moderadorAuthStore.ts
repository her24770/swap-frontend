import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Moderador } from "../types/moderador";

interface ModeradorAuthState {
  moderador: Moderador | null;
  login: (moderador: Moderador) => void;
  logout: () => void;
}

// Solo persiste datos de display (usuario, nivel) — el token vive en cookie HttpOnly
export const useModeradorAuthStore = create<ModeradorAuthState>()(
  persist(
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
    }
  )
);

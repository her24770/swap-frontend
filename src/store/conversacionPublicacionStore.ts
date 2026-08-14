import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConversacionPublicacionState {
  publicacionesPorConversacion: Record<number, number>;

  guardarRelacion: (
    idConversacion: number,
    idPublicacion: number
  ) => void;

  obtenerPublicacion: (
    idConversacion: number
  ) => number | undefined;

  eliminarRelacion: (
    idConversacion: number
  ) => void;
}

export const useConversacionPublicacionStore =
  create<ConversacionPublicacionState>()(
    persist(
      (set, get) => ({
        publicacionesPorConversacion: {},

        guardarRelacion: (idConversacion, idPublicacion) =>
          set((state) => ({
            publicacionesPorConversacion: {
              ...state.publicacionesPorConversacion,
              [idConversacion]: idPublicacion,
            },
          })),

        obtenerPublicacion: (idConversacion) =>
          get().publicacionesPorConversacion[idConversacion],

        eliminarRelacion: (idConversacion) =>
          set((state) => {
            const actualizado = {
              ...state.publicacionesPorConversacion,
            };

            delete actualizado[idConversacion];

            return {
              publicacionesPorConversacion: actualizado,
            };
          }),
      }),
      {
        name: "conversacion-publicacion",
      }
    )
  );
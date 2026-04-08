import { create } from "zustand";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  carnet: number;
  email_institucional: string;
  url_foto_perfil: string;
  descripcion: string | null;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  usuario: null,
  token: null,

  login: (usuario, token) => {
    set({ usuario, token });
  },

  logout: () => {
    set({ usuario: null, token: null });
  },
}));
import { create } from "zustand";

interface AuthState {
  usuario: any | null;
  token: string | null;
  rol: string | null;
  login: (usuario: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(() => ({
  usuario: null,
  token: null,
  rol: null,
  login: () => { throw new Error("Not implemented"); },
  logout: () => { throw new Error("Not implemented"); },
}));

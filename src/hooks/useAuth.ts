"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../lib/config";

export function useAuth() {
  const router = useRouter();
  const { usuario, rol, login, logout: limpiarSesion } = useAuthStore();

  async function logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Si el request falla igual limpiamos el estado local
    }
    limpiarSesion();
    router.push("/login");
  }

  return { usuario, rol, login, logout };
}

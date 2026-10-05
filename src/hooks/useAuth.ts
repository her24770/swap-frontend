"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useAuth() {
  const router = useRouter();
  const { usuario, rol, login, logout: limpiarSesion } = useAuthStore();

  async function logout() {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
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

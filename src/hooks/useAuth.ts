"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

// Hook que expone los datos de sesión y maneja el logout con redirección
export function useAuth() {
  const router = useRouter();
  const { usuario, token, rol, login, logout: limpiarSesion } = useAuthStore();

  // Limpia la sesión y redirige al login
  function logout() {
    limpiarSesion();
    router.push("/login");
  }

  return { usuario, token, rol, login, logout };
}

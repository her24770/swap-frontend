"use client";

import { useUIStore } from "../store/uiStore";
import type { ToastTipo } from "../store/uiStore";

export function useToast() {
  const { agregarNotificacion } = useUIStore();

  const toast = (
    tipo: ToastTipo,
    mensaje: string,
    titulo?: string,
    duracion?: number
  ) => agregarNotificacion({ tipo, mensaje, titulo, duracion });

  return {
    success: (mensaje: string, titulo?: string) => toast("success", mensaje, titulo),
    error:   (mensaje: string, titulo?: string) => toast("error",   mensaje, titulo),
    info:    (mensaje: string, titulo?: string) => toast("info",    mensaje, titulo),
    warning: (mensaje: string, titulo?: string) => toast("warning", mensaje, titulo),
  };
}
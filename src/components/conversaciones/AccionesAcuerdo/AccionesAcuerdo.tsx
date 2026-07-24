"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { useUIStore } from "../../../store/uiStore";
import "../../ui/Button/Button.css";
import "./AccionesAcuerdo.css";

interface AccionesAcuerdoProps {
  /** Estado actual del acuerdo (nombre, ej. "pendiente", "completado", "cancelado") */
  estado: string;
  /**
   * Indica si el usuario autenticado es el receptor de la solicitud, es decir,
   * quien debe responderla (no quien la creo). Lo calcula el componente padre,
   * que es quien conoce ambos participantes de la conversacion.
   */
  esReceptor: boolean;
  onAceptar: () => void | Promise<void>;
  onRechazar: () => void | Promise<void>;
  isLoading?: boolean;
}

/*
    Acciones de aceptar/rechazar una solicitud de acuerdo, visibles unicamente
    para el receptor de la solicitud y solo mientras el acuerdo siga pendiente.
*/
export default function AccionesAcuerdo({
  estado,
  esReceptor,
  onAceptar,
  onRechazar,
  isLoading = false,
}: AccionesAcuerdoProps) {
  const t = useTranslations("accionesAcuerdo");
  const { mostrarConfirm } = useUIStore();
  const [accionEnCurso, setAccionEnCurso] = useState<"aceptar" | "rechazar" | null>(null);

  if (estado !== "pendiente" || !esReceptor) return null;

  const handleAceptar = async () => {
    if (isLoading) return;
    setAccionEnCurso("aceptar");
    try {
      await onAceptar();
    } finally {
      setAccionEnCurso(null);
    }
  };

  const handleRechazar = () => {
    if (isLoading) return;
    mostrarConfirm({
      titulo: t("confirmRechazar.title"),
      mensaje: t("confirmRechazar.message"),
      onConfirm: async () => {
        setAccionEnCurso("rechazar");
        try {
          await onRechazar();
        } finally {
          setAccionEnCurso(null);
        }
      },
    });
  };

  return (
    <div className="acciones-acuerdo">
      <button
        type="button"
        className="acciones-acuerdo__btn acciones-acuerdo__btn--rechazar"
        onClick={handleRechazar}
        disabled={isLoading}
      >
        <X size={16} aria-hidden="true" />
        {accionEnCurso === "rechazar" ? t("rechazando") : t("rechazar")}
      </button>
      <button
        type="button"
        className="button button--small acciones-acuerdo__btn acciones-acuerdo__btn--aceptar"
        onClick={handleAceptar}
        disabled={isLoading}
      >
        <Check size={16} aria-hidden="true" />
        {accionEnCurso === "aceptar" ? t("aceptando") : t("aceptar")}
      </button>
    </div>
  );
}
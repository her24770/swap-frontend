import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "../../../lib/apiClient";
import { useUIStore } from "../../../store/uiStore";
import { guardarHorarioUsuario, obtenerHorarioUsuario } from "../../../services/horarioService";
import type { DiaHorario, EspacioHorario, EstadoHorario } from "../../../types/horario";

function horarioSlotKey(dia: DiaHorario, hora: number): string {
  return `${dia}-${hora}`;
}

function slotKeyFromSlot(slot: EspacioHorario): string {
  return horarioSlotKey(slot.dia, slot.hora);
}

function obtenerEstadoSlot(
  slots: EspacioHorario[],
  dia: DiaHorario,
  hora: number
): EstadoHorario {
  return slots.find((slot) => slot.dia === dia && slot.hora === hora)?.estado ?? "no_disponible";
}

// Horario semanal de un usuario: carga, edición de casillas y guardado con confirmación.
export function useHorarioTutor(idUsuario: number | undefined) {
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const [horarioSlots, setHorarioSlots] = useState<EspacioHorario[]>([]);
  const [horarioOriginal, setHorarioOriginal] = useState<EspacioHorario[]>([]);
  const [horarioLoading, setHorarioLoading] = useState(true);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [horarioEditando, setHorarioEditando] = useState(false);
  const [horarioGuardando, setHorarioGuardando] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<string>>(new Set());
  const [idUsuarioPrevio, setIdUsuarioPrevio] = useState(idUsuario);

  // Al cambiar el perfil consultado se reinicia el estado durante el render.
  if (idUsuarioPrevio !== idUsuario) {
    setIdUsuarioPrevio(idUsuario);
    setHorarioError(null);
    if (idUsuario) {
      setHorarioLoading(true);
    } else {
      setHorarioSlots([]);
      setHorarioOriginal([]);
      setHorarioLoading(false);
    }
  }

  const fetchHorario = useCallback(async () => {
    if (!idUsuario) return;

    try {
      const slots = await obtenerHorarioUsuario(idUsuario);
      setHorarioSlots(slots);
      setHorarioOriginal(slots);
      setCambiosPendientes(new Set());
      setHorarioEditando(false);
    } catch (err) {
      const apiError = err as ApiError;
      setHorarioError(apiError.message || "No fue posible obtener el horario");
    } finally {
      setHorarioLoading(false);
    }
  }, [idUsuario]);

  // fetchHorario solo hace setState después de un await
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHorario();
  }, [fetchHorario]);

  const handleToggleHorario = useCallback((dia: DiaHorario, hora: number) => {
    const key = horarioSlotKey(dia, hora);

    setHorarioSlots((prev) => {
      const actual = obtenerEstadoSlot(prev, dia, hora);
      if (actual === "ocupado") return prev;

      const siguienteEstado: EstadoHorario =
        actual === "disponible" ? "no_disponible" : "disponible";
      const sinSlot = prev.filter((slot) => slotKeyFromSlot(slot) !== key);
      const siguiente =
        siguienteEstado === "disponible"
          ? [...sinSlot, { dia, hora, estado: siguienteEstado }]
          : sinSlot;

      setCambiosPendientes((actuales) => {
        const next = new Set(actuales);
        const estadoOriginal = obtenerEstadoSlot(horarioOriginal, dia, hora);
        if (estadoOriginal === siguienteEstado) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      return siguiente;
    });
  }, [horarioOriginal]);

  const handleCancelarHorario = useCallback(() => {
    setHorarioSlots(horarioOriginal);
    setCambiosPendientes(new Set());
    setHorarioEditando(false);
  }, [horarioOriginal]);

  const guardarHorarioConfirmado = useCallback(async () => {
    if (!idUsuario) return;

    try {
      setHorarioGuardando(true);
      const slots = await guardarHorarioUsuario(idUsuario, horarioSlots);
      setHorarioSlots(slots);
      setHorarioOriginal(slots);
      setCambiosPendientes(new Set());
      setHorarioEditando(false);
      agregarNotificacion({
        tipo: "success",
        mensaje: "Horario actualizado correctamente.",
      });
    } catch (err) {
      const apiError = err as ApiError;
      agregarNotificacion({
        tipo: "error",
        mensaje: apiError.message || "No fue posible guardar el horario.",
      });
    } finally {
      setHorarioGuardando(false);
    }
  }, [agregarNotificacion, horarioSlots, idUsuario]);

  const handleGuardarHorario = useCallback(() => {
    mostrarConfirm({
      titulo: "Guardar cambios de horario",
      mensaje: `Se guardarán ${cambiosPendientes.size} cambios en tu disponibilidad semanal. ¿Deseas continuar?`,
      onConfirm: () => {
        void guardarHorarioConfirmado();
      },
    });
  }, [cambiosPendientes.size, guardarHorarioConfirmado, mostrarConfirm]);

  return {
    horarioSlots,
    horarioLoading,
    horarioError,
    horarioEditando,
    setHorarioEditando,
    horarioGuardando,
    cambiosPendientes,
    handleToggleHorario,
    handleCancelarHorario,
    handleGuardarHorario,
  };
}

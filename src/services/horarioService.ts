import { apiClient } from "../lib/apiClient";
import type { ApiResult } from "../types/ApiResult";
import type {
  BloqueHorarioApi,
  DiaHorario,
  EspacioHorario,
  EstadoHorario,
  GuardarHorarioBody,
} from "../types/horario";

const ESTADO_VISIBLE: Record<string, EstadoHorario> = {
  disponible: "disponible",
  ocupado: "ocupado",
  no_disponible: "no_disponible",
};

export async function obtenerHorarioUsuario(
  usuarioId: number
): Promise<EspacioHorario[]> {
  const response = await apiClient.get<ApiResult<BloqueHorarioApi[]> | BloqueHorarioApi[]>(
    `/api/horarios/${usuarioId}`
  );
  return bloquesToSlots(unwrapData(response));
}

export async function guardarHorarioUsuario(
  usuarioId: number,
  slots: EspacioHorario[]
): Promise<EspacioHorario[]> {
  const body: GuardarHorarioBody = {
    bloques: slots
      .filter((slot) => slot.estado === "disponible")
      .map((slot) => ({
        dia: slot.dia,
        hora_inicio: formatHora(slot.hora),
        hora_fin: formatHora(slot.hora + 1),
      })),
  };

  const response = await apiClient.put<ApiResult<BloqueHorarioApi[]> | BloqueHorarioApi[]>(
    `/api/horarios/${usuarioId}`,
    body
  );
  return bloquesToSlots(unwrapData(response));
}

function unwrapData<T>(response: ApiResult<T> | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResult<T>).data as T;
  }
  return response as T;
}

function bloquesToSlots(bloques: BloqueHorarioApi[] = []): EspacioHorario[] {
  const slots = new Map<string, EspacioHorario>();

  for (const bloque of bloques) {
    const inicio = parseHora(bloque.hora_inicio);
    const fin = parseHora(bloque.hora_fin);
    const estado = ESTADO_VISIBLE[bloque.estado ?? "disponible"] ?? "disponible";

    for (let hora = inicio; hora < fin; hora += 1) {
      slots.set(slotKey(bloque.dia, hora), {
        dia: bloque.dia,
        hora,
        estado,
      });
    }
  }

  return Array.from(slots.values());
}

function parseHora(hora: string): number {
  return Number(hora.slice(0, 2));
}

function formatHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

function slotKey(dia: DiaHorario, hora: number): string {
  return `${dia}-${hora}`;
}

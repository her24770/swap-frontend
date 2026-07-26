import { apiClient } from "../lib/apiClient";
import type {
  ActualizarEstadoConversacionData,
  ActualizarEstadoConversacionResponse,
} from "../types/conversacion";

export const conversacionService = {
  /*
      Aceptar o bloquear la solicitud de conversacion.
      estado_id debe ser el id del estado "activo" (aceptar) o "inactivo" (bloquear).
  */
  async actualizarEstado(
    idConversacion: number,
    estado_id: number
  ): Promise<ActualizarEstadoConversacionData> {
    const response = await apiClient.put<ActualizarEstadoConversacionResponse>(
      `/api/conversacion/${idConversacion}/estado`,
      { estado_id }
    );
    return response.data;
  },
};
import { apiClient } from "../lib/apiClient";
import type { ApiResult } from "../types/ApiResult";
import type { NotificacionData } from "../components/ui/Modal/NotificacionModal/Notificacion/Notificacion";

export interface NotificacionApi {
  id_notificacion: number;
  mensaje: string;
  id_usuario: number;
  id_estado: number;
  fecha: string;
  estado: { estado: string };
}

export function mapNotificacion(n: NotificacionApi): NotificacionData {
  return {
    id: n.id_notificacion,
    tipo: "sistema",
    titulo: "Notificación del sistema",
    descripcion: n.mensaje,
    fecha: new Date(n.fecha).toLocaleDateString("es-GT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    leida: n.estado.estado === "leido",
  };
}

export const notificacionService = {
  async getAll(): Promise<NotificacionData[]> {
    const response = await apiClient.get<ApiResult<NotificacionApi[]>>("/api/notificacion");
    return response.data.map(mapNotificacion);
  },

  /*
      Marca una notificacion como leida (PATCH /api/notificacion/:id/estado).
  */
  async marcarLeida(id: number): Promise<void> {
    await apiClient.patch<ApiResult<NotificacionApi>>(`/api/notificacion/${id}/estado`, {
      estado: "leido",
    });
  },

  /*
      Marca varias notificaciones como leidas. El backend no tiene un endpoint
      masivo, asi que llama al PATCH individual para cada id.
  */
  async marcarVariasLeidas(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.marcarLeida(id)));
  },
};

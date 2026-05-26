import { apiClient } from "../lib/apiClient";
import type { ApiResult } from "../types/ApiResult";
import type { NotificacionData } from "../components/ui/Modal/NotificacionModal/Notificacion/Notificacion";

interface NotificacionApi {
  id_notificacion: number;
  mensaje: string;
  id_usuario: number;
  id_estado: number;
  fecha: string;
  estado: { estado: string };
}

function mapNotificacion(n: NotificacionApi): NotificacionData {
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
};

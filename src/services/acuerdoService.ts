import { apiClient } from "../lib/apiClient";
import { conversacionService } from "./conversacionService";
import { formatDateTime } from "../utils/date";
import type {
  AcuerdosHistorialResult,
  AcuerdosHistorialResponse,
  TipoHistorialAcuerdo,
  AcuerdoHistorial,
} from "../types/acuerdo";
import type { SolicitudTutoriaNotificacion } from "../components/ui/Modal/NotificacionModal/Solicitud/Tutoria/TutoriaNotificacion";

interface HistorialUsuarioOptions {
  page?: number;
  limit?: number;
  q?: string;
}

interface AcuerdosConversacionResponse {
  success: boolean;
  message: string;
  data: AcuerdoHistorial[];
}

export interface CrearSolicitudAcuerdoInput {
  fecha_entrega: string; // ISO 8601
  lugar_entrega: string;
  observaciones: string;
  id_conversacion: number;
}

export interface EditarSolicitudAcuerdoInput {
  fecha_entrega: string; // ISO 8601
  lugar_entrega: string;
  observaciones: string;
}

export type EstadoAcuerdoNombre = "activo" | "pendiente" | "completado" | "cancelado";

interface AcuerdoRespuesta {
  success: boolean;
  message: string;
  data: {
    id_acuerdo: number;
    id_usuario: number;
    id_publicacion: number;
    fecha_entrega: string;
    lugar_entrega: string;
    observaciones: string;
    id_conversacion: number;
    estado: number;
  };
}

/**
 * Mapea un objeto de Acuerdo del backend al formato requerido por la tarjeta visual de notificación.
 */
export function mapAcuerdoToSolicitud(acuerdo: AcuerdoHistorial): SolicitudTutoriaNotificacion {
  const { fecha, hora } = formatDateTime(acuerdo.fecha_entrega);
  const tipoPerfil = acuerdo.publicacion?.tipoPerfil?.tipo_perfil;
  const alumno = acuerdo.publicacion?.usuario?.nombre ?? "Usuario";
  const avatarUrl = acuerdo.publicacion?.usuario?.url_foto_perfil ?? null;
  const tutoria = acuerdo.publicacion?.titulo ?? "";

  return {
    id: acuerdo.id_acuerdo,
    alumno,
    tutoria,
    fecha,
    hora,
    lugar: acuerdo.lugar_entrega || "Lugar a convenir",
    tema: acuerdo.observaciones || "Sin observaciones",
    avatarUrl,
    tipoPerfil,
    id_conversacion: acuerdo.id_conversacion,
  };
}

export const acuerdoService = {
  async getHistorialUsuario(
    idUsuario: number,
    tipo: TipoHistorialAcuerdo,
    options: HistorialUsuarioOptions = {}
  ): Promise<AcuerdosHistorialResult> {
    const params = new URLSearchParams({ tipo });
    if (options.page) params.set("page", options.page.toString());
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.q?.trim()) params.set("q", options.q.trim());

    const response = await apiClient.get<AcuerdosHistorialResponse>(
      `/api/acuerdo/user/${idUsuario}?${params.toString()}`
    );

    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: options.page ?? 1,
        limit: options.limit ?? response.data.length,
      };
    }

    return response.data;
  },

  /*
      Obtener los acuerdos asociados a una conversacion (GET /api/acuerdo/conversacion/:id)
  */
  async getPorConversacion(idConversacion: number): Promise<AcuerdoHistorial[]> {
    const response = await apiClient.get<AcuerdosConversacionResponse>(
      `/api/acuerdo/conversacion/${idConversacion}`
    );
    return response.data;
  },

  /*
      Consulta todas las solicitudes de acuerdos pendientes que ha recibido el usuario autenticado.
  */
  async getSolicitudesPendientesUsuario(idUsuarioActual?: number): Promise<SolicitudTutoriaNotificacion[]> {
    try {
      const conversaciones = await conversacionService.listar();
      if (!conversaciones || conversaciones.length === 0) return [];

      const resultados = await Promise.allSettled(
        conversaciones.map((c) => acuerdoService.getPorConversacion(c.id_conversacion))
      );

      const acuerdosPendientes: AcuerdoHistorial[] = [];
      resultados.forEach((res) => {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          const pendientes = res.value.filter((a) => {
            const esPendiente = a.estadoRel?.estado === "pendiente";
            // Solo considerar como notificación entrante si no fue el usuario actual quien la creó
            const esEntrante = idUsuarioActual ? a.id_ofertante !== idUsuarioActual : true;
            return esPendiente && esEntrante;
          });
          acuerdosPendientes.push(...pendientes);
        }
      });

      return acuerdosPendientes.map(mapAcuerdoToSolicitud);
    } catch {
      return [];
    }
  },

  /*
      Crear una solicitud de acuerdo sobre una publicacion (POST /api/acuerdo/:idPublicacion)
  */
  async crearSolicitud(
    idPublicacion: number,
    data: CrearSolicitudAcuerdoInput
  ): Promise<AcuerdoRespuesta["data"]> {
    const response = await apiClient.post<AcuerdoRespuesta>(`/api/acuerdo/${idPublicacion}`, data);
    return response.data;
  },

  /*
      Actualizar el estado de un acuerdo (PUT /api/acuerdo/:idAcuerdo).
      Un mismo endpoint sirve para aceptar ("activo"), rechazar ("cancelado")
      y marcar como completado ("completado").
  */
  async actualizarEstado(
    idAcuerdo: number,
    estado: EstadoAcuerdoNombre
  ): Promise<AcuerdoRespuesta["data"]> {
    const response = await apiClient.put<AcuerdoRespuesta>(`/api/acuerdo/${idAcuerdo}`, { estado });
    return response.data;
  },

  /*
      Editar una solicitud de acuerdo existente (PUT /api/acuerdo/:idAcuerdo/editar)
  */
  async editarSolicitud(
    idAcuerdo: number,
    data: EditarSolicitudAcuerdoInput
  ): Promise<AcuerdoRespuesta["data"]> {
    const response = await apiClient.put<AcuerdoRespuesta>(
      `/api/acuerdo/${idAcuerdo}/editar`,
      data
    );

    return response.data;
  },
};
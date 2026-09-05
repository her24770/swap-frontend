import { apiClient } from "../lib/apiClient";
import type {
  AcuerdosHistorialResult,
  AcuerdosHistorialResponse,
  TipoHistorialAcuerdo,
  AcuerdoHistorial,
} from "../types/acuerdo";

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
      `/api/acuerdo/?${params.toString()}`
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
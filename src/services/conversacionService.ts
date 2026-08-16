import { apiClient } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";
import type { ApiResult } from "../types/ApiResult";
import type { ConversacionPreview, ContextoConversacionChat, Mensaje } from "../types/chat";
import type {
  ActualizarEstadoConversacionData,
  ActualizarEstadoConversacionResponse,
} from "../types/conversacion";

interface UsuarioConversacionApi {
  id_usuario: number;
  nombre: string;
  url_foto_perfil: string;
}

interface ConversacionApi {
  id_conversacion: number;
  id_usuario_1: number;
  id_usuario_2: number;
  estado_conversacion: number;
  usuario1?: UsuarioConversacionApi;
  usuario2?: UsuarioConversacionApi;
  mensajes?: { mensaje: string; fecha_enviado: string }[];
  contextos?: ContextoConversacionChat[];
}

interface IniciarConversacionApi {
  conversacion: ConversacionApi;
  mensaje: Mensaje;
}

function mapConversacion(
  conversacion: ConversacionApi,
  idUsuarioActual: number,
  idEstadoPendiente?: number
): ConversacionPreview {
  const esUsuario1 = conversacion.id_usuario_1 === idUsuarioActual;
  const otro = esUsuario1 ? conversacion.usuario2 : conversacion.usuario1;
  const ultimoMensaje = conversacion.mensajes?.[0];

  return {
    id_conversacion: conversacion.id_conversacion,
    nombre: otro?.nombre ?? "Usuario",
    preview: ultimoMensaje?.mensaje ?? "",
    fecha_ultimo_mensaje: ultimoMensaje
      ? new Date(ultimoMensaje.fecha_enviado).toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined,
    avatarUrl: otro?.url_foto_perfil ?? null,
    // Solo es "solicitud" (requiere confirmar/eliminar) para el destinatario:
    // el backend solo permite responder a id_usuario_2 (ver PUT /:id/estado).
    esSolicitud:
      idEstadoPendiente != null
      && conversacion.estado_conversacion === idEstadoPendiente
      && conversacion.id_usuario_2 === idUsuarioActual,
    contextos: conversacion.contextos ?? [],
  };
}

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

  /*
      Lista las conversaciones del usuario autenticado, ordenadas por el
      backend según la fecha del último mensaje (GET /api/conversacion/conversaciones).
      idEstadoPendiente se usa para saber si una conversacion es una solicitud
      dirigida al usuario actual (ver mapConversacion).
  */
  async listar(idEstadoPendiente?: number): Promise<ConversacionPreview[]> {
    const idUsuarioActual = useAuthStore.getState().usuario?.id_usuario;
    if (!idUsuarioActual) return [];

    const response = await apiClient.get<ApiResult<ConversacionApi[]>>(
      "/api/conversacion/conversaciones"
    );
    return response.data.map((c) => mapConversacion(c, idUsuarioActual, idEstadoPendiente));
  },

  /*
      Historial de mensajes de una conversacion, ordenados cronologicamente
      (GET /api/conversacion/:id/mensajes).
  */
  async obtenerMensajes(idConversacion: number): Promise<Mensaje[]> {
    const response = await apiClient.get<ApiResult<Mensaje[]>>(
      `/api/conversacion/${idConversacion}/mensajes`
    );
    return response.data;
  },

  /*
      Inicia una conversacion con otro usuario enviando el primer mensaje.
      Si ya existe una conversacion entre ambos, el backend reutiliza esa
      conversacion y solo agrega el mensaje (POST /api/conversacion).
  */
  async iniciarConversacion(
    idUsuario2: number,
    mensaje: string,
    idEstadoPendiente?: number,
    idPublicacion?: number
  ): Promise<{ conversacion: ConversacionPreview; mensaje: Mensaje }> {
    const idUsuarioActual = useAuthStore.getState().usuario?.id_usuario ?? 0;

    const payload = {
      id_usuario_2: idUsuario2,
      mensaje,
      ...(idPublicacion != null && {
        id_publicacion: idPublicacion,
      }),
    };

    const response = await apiClient.post<ApiResult<IniciarConversacionApi>>(
      "/api/conversacion",
      payload
    );

    return {
      conversacion: mapConversacion(response.data.conversacion, idUsuarioActual, idEstadoPendiente),
      mensaje: response.data.mensaje,
    };
  },
};
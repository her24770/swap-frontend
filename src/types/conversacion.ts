export interface Conversacion {
  id_conversacion: number;
  id_usuario_1: number;
  id_usuario_2: number;
  estado_conversacion: number;
}

export interface ActualizarEstadoConversacionData {
  id_conversacion: number;
  estado: number;
  estado_nombre: "activo" | "inactivo";
}

export interface ActualizarEstadoConversacionResponse {
  success: boolean;
  message: string;
  data: ActualizarEstadoConversacionData;
}
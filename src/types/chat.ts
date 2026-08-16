export type TabMensajes = "todas" | "ventas" | "compras";
export type TipoPanel = "acuerdo" | "publicacion" | "opciones" | "historial" | null;

export interface EstadoChat {
  id_estado: number;
  estado: string;
}

export interface UsuarioChat {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  url_foto_perfil?: string | null;
}

export interface Mensaje {
  id_mensaje: number;
  id_conversacion: number;
  id_emisor: number;
  mensaje: string;
  estado_mensaje: number;
  fecha_enviado: string;
  emisor?: UsuarioChat;
  estadoRel?: EstadoChat;
}

export interface Acuerdo {
  id_acuerdo: number;
  id_usuario: number;
  id_publicacion: number;
  fecha_entrega: string;
  lugar_entrega: string;
  observaciones: string;
  id_conversacion: number;
  estado: number;
  estadoRel?: EstadoChat;
}

export interface Conversacion {
  id_conversacion: number;
  id_usuario_1: number;
  id_usuario_2: number;
  estado_conversacion: number;
  usuario1?: UsuarioChat;
  usuario2?: UsuarioChat;
  estadoRel?: EstadoChat;
  mensajes?: Mensaje[];
  acuerdos?: Acuerdo[];
  contextos?: ContextoConversacionChat;
  ultimo_mensaje?: Mensaje | null;
}

export interface PublicacionContextoChat {
  id_publicacion: number;
  titulo: string;
  precio: number;
  id_usuario: number;
  imagenes?: {
    url_imagen: string;
  }[];
}

export interface ContextoConversacionChat {
  id_contexto: number;
  id_conversacion: number;
  id_publicacion: number;
  id_usuario: number;
  fecha_contexto: string;
  publicacion: PublicacionContextoChat;
  usuario: {
    id_usuario: number;
    nombre: string;
  };
}

export interface ConversacionPreview {
  id_conversacion: number;
  id_otro_usuario: number;
  nombre: string;
  preview: string;
  fecha_ultimo_mensaje?: string;
  ultimo_mensaje?: Mensaje | null;
  esSolicitud?: boolean;
  avatarUrl?: string | null;
  contextos?: ContextoConversacionChat[];
  estado_conversacion: number;
}

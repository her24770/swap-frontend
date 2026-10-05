import type { ImagenPublicacion } from "./publicacion";

export type TipoHistorialAcuerdo = "producto" | "material" | "negocio" | "tutoria";
export type TipoCompraHistorial = "producto" | "material" | "negocio";

export interface AcuerdoHistorial {
  id_acuerdo: number;
  id_usuario: number;
  id_ofertante: number;
  id_publicacion: number;
  fecha_entrega: string;
  lugar_entrega: string;
  observaciones: string;
  id_conversacion: number;
  estado: number;
  publicacion: {
    id_publicacion: number;
    titulo: string;
    descripcion: string;
    precio: string;
    estado: number;
    tipo_publicacion: number;
    me_gusta: number;
    fecha_publicacion: string;
    id_usuario: number;
    imagenes: ImagenPublicacion[];
    tipoPerfil?: {
      id_tipo_perfil: number;
      tipo_perfil: string;
    };
    usuario?: {
      id_usuario: number;
      nombre: string;
      url_foto_perfil: string;
      calificacion?: number | null;
    };
  };
  estadoRel?: {
    id_estado: number;
    estado: string;
  };
}

export interface AcuerdosHistorialResponse {
  success: boolean;
  message: string;
  data: AcuerdoHistorial[] | AcuerdosHistorialPaginatedData;
}

export interface AcuerdosHistorialPaginatedData {
  data: AcuerdoHistorial[];
  total: number;
  page: number;
  limit: number;
}

export interface AcuerdosHistorialResult {
  data: AcuerdoHistorial[];
  total: number;
  page: number;
  limit: number;
}

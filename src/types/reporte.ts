export type TipoObjetivoReporte = "usuario" | "publicacion" | "comentario";

export type MotivoReporte =
  | "No cumplió con fechas"
  | "Información falsa"
  | "Incumple las normas"
  | "Cuenta falsa o suplantación de identidad"
  | "Publica contenido inapropiado"
  | "Acoso, amenazas o bullying"
  | "Spam o estafa"
  | "Es ofensivo, insultante o usa lenguaje vulgar"
  | "Es spam, publicidad no deseada o enlace sospechoso"
  | "Acoso dirigido a otro usuario en la conversación"
  | "Revela información personal privada"
  | "Venta o promoción de objetos inapropiados"
  | "Discurso de odio o símbolos ofensivos"
  | "Violencia, daño o actividades peligrosas"
  | "Desnudez o contenido sexual explícito"
  | "Propiedad intelectual o derechos de autor";

export interface CrearReportePayload {
  tipo_objetivo: TipoObjetivoReporte;
  id_objetivo: number;
  motivo: MotivoReporte;
  detalle?: string;
}

export interface Reporte {
  id_reporte: number;
  id_emisor: number;
  id_receptor: number;
  id_publicacion?: number | null;
  id_mensaje?: number | null;
  motivo: number;
  observaciones: string;
  fecha: string;
  estado: number;
  link_imagen: string;
  id_moderador?: number | null;
}

/**
 * Refleja GET /api/reportes (paginado)
 */
export interface ReporteTableUsuario {
  nombre: string;
  email_institucional: string;
  url_foto_perfil: string;
}

export interface ReporteTableData {
  id_reporte: number;
  tipo: "Publicación" | "Mensaje";
  fecha: string;
  estado: string;
  emisor: ReporteTableUsuario;
  receptor: ReporteTableUsuario;
}

export interface ResultadoBusquedaReporte {
  reportes: ReporteTableData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportePaginationOptions {
  page?: number;
  limit?: number;
  sort?: "fecha" | "estado";
  order?: "asc" | "desc";
  estado?: string;
  motivo?: string;
  tipo?: "publicacion" | "mensaje" | "todos";
  idReceptor?: number;
  idEmisor?: number;
}

export const motivosReportePorObjetivo: Record<TipoObjetivoReporte, MotivoReporte[]> = {
  usuario: [
    "No cumplió con fechas",
    "Información falsa",
    "Incumple las normas",
    "Cuenta falsa o suplantación de identidad",
    "Publica contenido inapropiado",
    "Acoso, amenazas o bullying",
    "Spam o estafa",
  ],
  comentario: [
    "Es ofensivo, insultante o usa lenguaje vulgar",
    "Es spam, publicidad no deseada o enlace sospechoso",
    "Acoso dirigido a otro usuario en la conversación",
    "Revela información personal privada",
    "Información falsa",
    "Acoso, amenazas o bullying",
    "Venta o promoción de objetos inapropiados",
  ],
  publicacion: [
    "Discurso de odio o símbolos ofensivos",
    "Información falsa",
    "Violencia, daño o actividades peligrosas",
    "Desnudez o contenido sexual explícito",
    "Propiedad intelectual o derechos de autor",
    "Acoso, amenazas o bullying",
    "Spam o estafa",
  ],
};

export interface UsuarioModeracion {
  id_usuario: number;
  nombre: string;
  carnet: number;
  email_institucional: string;
  url_foto_perfil: string;
  calificacion: number | string | null;
  total_resenas: number;
  reportes_recibidos: number;
  tiempo_suspendido: number;
}

export interface UsuarioModeracionFilters {
  q?: string;
  sort?: "nombre" | "calificacion" | "reportes_recibidos" | "total_resenas";
  order?: "asc" | "desc";
  conReportes?: boolean;
  page?: number;
  limit?: number;
}

export interface UsuariosModeracionResult {
  usuarios: UsuarioModeracion[];
  total: number;
  page: number;
  limit: number;
}
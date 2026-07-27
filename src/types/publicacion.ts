export interface ImagenPublicacion {
  id_imagen: number;
  url_imagen: string;
  id_publicacion: number;
}

export interface PublicacionEtiquetaRel {
  id_publicacion: number;
  id_etiqueta: number;
  etiqueta: {
    id_etiqueta: number;
    nombre: string;
    descripcion?: string;
    id_etiqueta_padre?: number | null;
  };
}

export interface Publicacion {
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
  etiquetas: PublicacionEtiquetaRel[];
  esGuardada?: boolean;
  likeado?: boolean;
  estadoRel?: {
    id_estado: number;
    estado: string;
  };
  tipoPerfil?: {
    id_tipo_perfil: number;
    tipo_perfil: string;
  };
  usuario?: {
    id_usuario: number;
    nombre: string;
    url_foto_perfil: string;
    calificacion: number;
    email_institucional: string;
  };
}

export interface PublicacionesResponse {
  message: string;
  data: Publicacion[];
  total?: number;
}

export interface PublicacionesResponse_Explorar {
  message: string;
  data:{
    publicaciones: Publicacion[];
    total: number;
  };
  total?: number;
}

export interface PublicacionesResult {
  data: Publicacion[];
  total: number;
}

// Filtros para obtener publicaciones del api.
export interface PublicacionFilters {
  tipo?: 'negocio' | 'material' | 'tutoria';
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  all?: boolean;
  recommended?: boolean;
  personalized?: boolean;
}

export interface PublicacionDetalle {
  id_publicacion: number;
  titulo: string;
  descripcion: string;
  precio: string;
  me_gusta: number;
  fecha_publicacion: string;

  usuario: {
    id_usuario: number;
    nombre: string;
    url_foto_perfil: string;
    calificacion: number;
    email_institucional: string;
  };
  
  estadoRel: {
    id_estado: number;
    estado: string;
  };

  tipoPerfil: {
    id_tipo_perfil: number;
    tipo_perfil: string;
  };

  imagenes: ImagenPublicacion[];

  etiquetas: PublicacionEtiquetaRel[];

  esGuardada?: boolean;
}

export interface PublicacionDetalleResponse {
  message: string;
  data: PublicacionDetalle;
}

export interface FiltroTutorBody {
  etiquetas?: number[];
  precio_min?: number;
  precio_max?: number;
  calificacion_min?: number;
  calificacion_max?: number;
  dias?: string[];
  hora_inicio?: string;
  hora_final?: string;
  page?: number;
  limit?: number;
}

export interface TutorFiltrado {
  id_usuario: number;
  nombre: string;
  url_foto_perfil: string;
  descripcion: string | null;
  calificacion: number | null;
  publicaciones: Array<{ titulo: string }>;
}

export interface FiltroTutorApiResponse {
  message: string;
  data: {
    tutores: TutorFiltrado[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FiltroPublicacionBody {
  tipo?: 'negocio' | 'material' | 'tutoria';
  precio_min?: number;
  precio_max?: number;
  calificacion_min?: number;
  calificacion_max?: number;
  etiquetas?: number[];
  sort?: 'fecha' | 'precio' | 'me_gusta' | 'calificacion';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FiltroPublicacionApiResponse {
  message: string;
  data: {
    publicaciones: Publicacion[];
    total: number;
    page: number;
    limit: number;
  };
}

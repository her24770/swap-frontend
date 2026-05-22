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
}

// Filtros para obtener publicaciones del api.
export interface PublicacionFilters {
  tipo?: 'negocio' | 'material' | 'tutoria';
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  all?: boolean;
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

  etiquetas: {
    etiqueta: {
      id_etiqueta: number;
      nombre: string;
    };
  }[];

  esGuardada?: boolean;
}

export interface PublicacionDetalleResponse {
  message: string;
  data: PublicacionDetalle;
}

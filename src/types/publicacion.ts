export interface ImagenPublicacion {
  id_imagen: number;
  url_imagen: string;
  id_publicacion: number;
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
  etiquetas: unknown[];
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

export interface VendedorResumen {
  id_usuario: number;
  nombre: string;
  calificacion: number;
  url_foto_perfil?: string;
}
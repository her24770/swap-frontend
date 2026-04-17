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
  imagenes: unknown[];
  etiquetas: unknown[];
}

export interface PublicacionesResponse {
  message: string;
  data: Publicacion[];
}

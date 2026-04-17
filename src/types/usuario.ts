export type Rol = "usuario" | "moderador";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  carnet: number;
  email_institucional: string;
  url_foto_perfil: string;
  descripcion: string | null;
  calificacion: number | null;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  rol: Rol;
}

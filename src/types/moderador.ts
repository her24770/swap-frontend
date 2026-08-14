export type NivelModerador = "moderador" | "superadmin";

export interface Moderador {
  id_moderador: number;
  usuario: string;
  nivel: NivelModerador;
}

export interface AuthResponseModerador {
  rol: NivelModerador;
  moderador: Moderador;
}

export type DiaHorario =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type EstadoHorario = "disponible" | "ocupado" | "no_disponible";

export interface EspacioHorario {
  dia: DiaHorario;
  hora: number;
  estado: EstadoHorario;
}

export interface BloqueHorarioApi {
  id_tiempo?: number;
  id_usuario?: number;
  dia: DiaHorario;
  hora_inicio: string;
  hora_fin: string;
  estado?: EstadoHorario | "disponible";
}

export interface GuardarHorarioBody {
  bloques: {
    dia: DiaHorario;
    hora_inicio: string;
    hora_fin: string;
  }[];
}

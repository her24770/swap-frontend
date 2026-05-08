import "./Horario.css";

export type EstadoHorario = "disponible" | "ocupado" | "no_disponible";

export interface EspaciosHorario {
  dia: string;
  hora: number;
  estado: EstadoHorario;
}

interface HorarioSemanalProps {
  slots?: EspaciosHorario[];
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HORAS = [7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];

function getEstado(slots: EspaciosHorario[], dia: string, hora: number): EstadoHorario {
  return slots.find((s) => s.dia === dia && s.hora === hora)?.estado ?? "no_disponible";
}

function formatHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

export default function HorarioSemanal({slots = []}: HorarioSemanalProps) {
  return (
    <div className="horario">
      <div className="horario__header">
        <div className="horario__legend">
          <div className="horario__legend-item">
            <span className="horario__dot horario__dot--disponible" />
            Disponible
          </div>
          <div className="horario__legend-item">
            <span className="horario__dot horario__dot--ocupado" />
            Ocupado
          </div>
          <div className="horario__legend-item">
            <span className="horario__dot horario__dot--no-disponible" />
            No Disponible
          </div>
        </div>
      </div>

      <div className="horario__scroll">
        <div className="horario__grid">

          {/* Header de los dias */}
          <div className="horario__col-header horario__col-header--hora">
            HORA
          </div>
          {DIAS.map((dia) => (
            <div key={dia} className="horario__col-header">
              {dia}
            </div>
          ))}

          {/* Filas por hora */}
          {HORAS.map((hora) => (
            <>
              <div key={`hora-${hora}`} className="horario__hora">
                {formatHora(hora)}
              </div>
              {DIAS.map((dia) => {
                const estado = getEstado(slots, dia, hora);
                return (
                  <div
                    key={`${dia}-${hora}`}
                    className={`horario__slot horario__slot--${estado.replace("_", "-")}`}
                  >
                    {estado === "disponible" && "Disponible"}
                    {estado === "ocupado" && "Ocupado"}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
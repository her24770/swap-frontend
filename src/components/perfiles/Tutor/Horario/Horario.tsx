import { Fragment } from "react";
import type { DiaHorario, EspacioHorario, EstadoHorario } from "../../../../types/horario";
import "./Horario.css";

interface HorarioSemanalProps {
  slots?: EspacioHorario[];
  editable?: boolean;
  disabled?: boolean;
  pendingKeys?: Set<string>;
  onToggleSlot?: (dia: DiaHorario, hora: number) => void;
}

const DIAS: { key: DiaHorario; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];
const HORAS = [7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];

function getEstado(slots: EspacioHorario[], dia: DiaHorario, hora: number): EstadoHorario {
  return slots.find((s) => s.dia === dia && s.hora === hora)?.estado ?? "no_disponible";
}

function formatHora(hora: number): string {
  return `${String(hora).padStart(2, "0")}:00`;
}

function slotKey(dia: DiaHorario, hora: number): string {
  return `${dia}-${hora}`;
}

export default function HorarioSemanal({
  slots = [],
  editable = false,
  disabled = false,
  pendingKeys,
  onToggleSlot,
}: HorarioSemanalProps) {
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
            <div key={dia.key} className="horario__col-header">
              {dia.label}
            </div>
          ))}

          {/* Filas por hora */}
          {HORAS.map((hora) => (
            <Fragment key={hora}>
              <div key={`hora-${hora}`} className="horario__hora">
                {formatHora(hora)}
              </div>
              {DIAS.map((dia) => {
                const estado = getEstado(slots, dia.key, hora);
                const key = slotKey(dia.key, hora);
                const className = `horario__slot horario__slot--${estado.replace("_", "-")}${
                  editable ? " horario__slot--editable" : ""
                }${pendingKeys?.has(key) ? " horario__slot--pending" : ""}`;

                if (editable) {
                  return (
                    <button
                      key={key}
                      type="button"
                      className={className}
                      disabled={disabled}
                      aria-pressed={estado === "disponible"}
                      aria-label={`${dia.label} ${formatHora(hora)}`}
                      onClick={() => onToggleSlot?.(dia.key, hora)}
                    >
                      {estado === "disponible" && "Disponible"}
                      {estado === "ocupado" && "Ocupado"}
                    </button>
                  );
                }

                return (
                  <div
                    key={key}
                    className={className}
                  >
                    {estado === "disponible" && "Disponible"}
                    {estado === "ocupado" && "Ocupado"}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

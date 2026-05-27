import React from "react";
import { Skeleton } from '../../../../ui/Skeleton/Skeleton';
import './HorarioSkeleton.css';

const HORAS = 9;
const DIAS  = 7;

export function HorarioSkeleton() {
  return (
    <div className="horario-sk" aria-label="Cargando horario..." aria-busy="true">

      {/* Header*/}
      <div className="horario-sk__header">
        <Skeleton variant="text" className="horario-sk__title" />
        <div className="horario-sk__legend">
          <Skeleton className="horario-sk__legend-item" />
          <Skeleton className="horario-sk__legend-item" />
          <Skeleton className="horario-sk__legend-item" />
        </div>
      </div>

      {/* Grid */}
      <div className="horario-sk__scroll">
        <div className="horario-sk__grid">

          {/* Cabeceras de días */}
          <div className="horario-sk__cell" />
          {Array.from({ length: DIAS }).map((_, d) => (
            <div key={d} className="horario-sk__cell horario-sk__cell--header">
              <Skeleton variant="text" className="horario-sk__day" />
            </div>
          ))}

          {/* Filas de horas */}
          {Array.from({ length: HORAS }).map((_, h) => (
            <React.Fragment key={`row-${h}`}>
              <div className="horario-sk__cell">
                <Skeleton variant="text" className="horario-sk__hour" />
              </div>
              {Array.from({ length: DIAS }).map((_, d) => (
                <div key={`${h}-${d}`} className="horario-sk__cell">
                  <Skeleton className="horario-sk__slot" />
                </div>
              ))}
            </React.Fragment>
          ))}

        </div>
      </div>

    </div>
  );
}
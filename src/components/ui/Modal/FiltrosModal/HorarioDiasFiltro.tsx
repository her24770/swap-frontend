"use client";

import { useTranslations } from "next-intl";
import type { DiaHorario } from "../../../../types/horario";
import "./HorarioDiasFiltro.css";

const DIAS_FULL: DiaHorario[] = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

interface HorarioDiasFiltroProps {
  horaDesde: string;
  horaHasta: string;
  dias: DiaHorario[];
  onHoraDesdeChange: (value: string) => void;
  onHoraHastaChange: (value: string) => void;
  onToggleDia: (dia: DiaHorario) => void;
}

// Filtros de horario y días de la semana.
export default function HorarioDiasFiltro({
  horaDesde,
  horaHasta,
  dias,
  onHoraDesdeChange,
  onHoraHastaChange,
  onToggleDia,
}: HorarioDiasFiltroProps) {
  const t = useTranslations("common.filtros");

  return (
    <>
      <div className="filtros-panel__section">
        <span className="filtros-panel__label">{t("horario")}</span>
        <div className="filtros-panel__time-row">
          <div className="filtros-panel__time-group">
            <span className="filtros-panel__time-label">{t("timeFrom")}</span>
            <input
              type="time"
              value={horaDesde}
              onChange={(e) => onHoraDesdeChange(e.target.value)}
              className="filtros-panel__time-input"
            />
          </div>
          <div className="filtros-panel__time-group">
            <span className="filtros-panel__time-label">{t("timeTo")}</span>
            <input
              type="time"
              value={horaHasta}
              onChange={(e) => onHoraHastaChange(e.target.value)}
              className="filtros-panel__time-input"
            />
          </div>
        </div>
      </div>

      <div className="filtros-panel__section">
        <span className="filtros-panel__label">{t("dias")}</span>
        <div className="filtros-panel__days-row">
          {DIAS_FULL.map((dia) => (
            <button
              key={dia}
              type="button"
              className={`filtros-panel__day-btn${dias.includes(dia) ? " filtros-panel__day-btn--active" : ""}`}
              onClick={() => onToggleDia(dia)}
              aria-label={t(`daysAria.${dia}`)}
            >
              {t(`daysShort.${dia}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

import type { MotivoReporte } from "../../../../types/reporte";

interface ReporteMotivoOptionProps {
  motivo: MotivoReporte;
  seleccionado: boolean;
  onSeleccionar: (motivo: MotivoReporte) => void;
}

export default function ReporteMotivoOption({
  motivo,
  seleccionado,
  onSeleccionar,
}: ReporteMotivoOptionProps) {
  return (
    <label className="reporte-modal__motivo">
      <input
        type="radio"
        name="motivo-reporte"
        value={motivo}
        checked={seleccionado}
        onChange={() => onSeleccionar(motivo)}
      />
      <span className="reporte-modal__radio" aria-hidden="true" />
      <span className="reporte-modal__motivo-text">{motivo}</span>
    </label>
  );
}

interface ReporteMotivoOptionProps<TMotivo extends string> {
  motivo: TMotivo;
  seleccionado: boolean;
  onSeleccionar: (motivo: TMotivo) => void;
}

export default function ReporteMotivoOption<TMotivo extends string>({
  motivo,
  seleccionado,
  onSeleccionar,
}: ReporteMotivoOptionProps<TMotivo>) {
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

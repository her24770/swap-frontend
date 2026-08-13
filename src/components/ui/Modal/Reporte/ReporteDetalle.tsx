interface ReporteDetalleProps {
  valor: string;
  limiteCaracteres: number;
  onCambiar: (valor: string) => void;
}

export default function ReporteDetalle({
  valor,
  limiteCaracteres,
  onCambiar,
}: ReporteDetalleProps) {
  return (
    <label className="reporte-modal__detalle">
      <span className="reporte-modal__section-title">Detalle adicional</span>
      <textarea
        className="reporte-modal__textarea"
        value={valor}
        maxLength={limiteCaracteres}
        onChange={(event) => onCambiar(event.target.value)}
        placeholder="Cuéntanos más detalles..."
      />
      <span className="reporte-modal__contador">
        {valor.length}/{limiteCaracteres}
      </span>
    </label>
  );
}

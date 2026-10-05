import { useTranslations } from "next-intl";

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
  const t = useTranslations("reporte.detalle");

  return (
    <label className="reporte-modal__detalle">
      <span className="reporte-modal__section-title">{t("title")}</span>
      <textarea
        className="reporte-modal__textarea"
        value={valor}
        maxLength={limiteCaracteres}
        onChange={(event) => onCambiar(event.target.value)}
        placeholder={t("placeholder")}
      />
      <span className="reporte-modal__contador">
        {valor.length}/{limiteCaracteres}
      </span>
    </label>
  );
}

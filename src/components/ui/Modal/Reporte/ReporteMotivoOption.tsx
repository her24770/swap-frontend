import { useTranslations } from "next-intl";

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
  const t = useTranslations("reporte.motivos");
  // Los motivos personalizados que llegan ya traducidos (p. ej. reactivación)
  // no están en el diccionario: en ese caso se muestra el texto tal cual.
  // El cast evita el tipado estricto de claves dinámicas de next-intl.
  const traducir = t as unknown as (clave: string) => string;
  const etiqueta = t.has(motivo) ? traducir(motivo) : motivo;

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
      <span className="reporte-modal__motivo-text">{etiqueta}</span>
    </label>
  );
}

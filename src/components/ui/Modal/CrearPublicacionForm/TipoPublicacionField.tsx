"use client";

import { useTranslations } from "next-intl";
import { TIPOS_PUBLICACION, type TipoPublicacion } from "../../../../schemas/zodSchemas";
import "./TipoPublicacionField.css";

interface TipoPublicacionFieldProps {
  value: TipoPublicacion;
  /** Si es true se puede elegir el tipo; si no, se muestra de solo lectura. */
  editable: boolean;
  onChange: (tipo: TipoPublicacion) => void;
}

export default function TipoPublicacionField({ value, editable, onChange }: TipoPublicacionFieldProps) {
  const t = useTranslations("publicacionForm");
  const tTags = useTranslations("common.tags");

  const labelDe = (tipo: TipoPublicacion) =>
    tipo === "material" ? tTags("material") : tipo === "tutoria" ? tTags("tutoria") : tTags("negocio");

  return (
    <div className="crear-publicacion__field">
      <label className="crear-publicacion__label">{t("fields.type")}</label>
      {editable ? (
        <div className="crear-publicacion__tipo-selector">
          {TIPOS_PUBLICACION.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`crear-publicacion__tipo-btn${value === tipo ? " crear-publicacion__tipo-btn--active" : ""}`}
              onClick={() => onChange(tipo)}
            >
              {labelDe(tipo)}
            </button>
          ))}
        </div>
      ) : (
        <div className="crear-publicacion__readonly-value" aria-readonly="true">
          {labelDe(value)}
        </div>
      )}
    </div>
  );
}

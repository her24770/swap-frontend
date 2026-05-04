"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import "./EstadoTag.css";

interface EstadoTagProps {
  estado: string | number;
  canEdit?: boolean;
  onEstadoChange?: (nuevoEstado: string) => void;
}

const ESTADOS = [
  { id: "disponible", labelKey: "fields.statusAvailable", color: "green" },
  { id: "reservado", labelKey: "fields.statusReserved", color: "gray" },
  { id: "vendido", labelKey: "fields.statusSold", color: "blue" },
];

const getEstadoConfig = (estado: string | number) => {
  const estadoStr = String(estado).toLowerCase();
  return ESTADOS.find((e) => e.id === estadoStr) || ESTADOS[0];
};

export default function EstadoTag({
  estado,
  canEdit = false,
  onEstadoChange,
}: EstadoTagProps) {
  const t = useTranslations("publicacionForm");

  const [isOpen, setIsOpen] = useState(false);
  const config = getEstadoConfig(estado);
  const label = t(config.labelKey);

  const handleEstadoChange = (nuevoEstado: string) => {
    onEstadoChange?.(nuevoEstado);
    setIsOpen(false);
  };

  if (!canEdit) {
    return (
      <span
        className={`estado-tag estado-tag--${config.color}`}
        title={label}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="estado-tag-wrapper">
      <button
        type="button"
        className={`estado-tag estado-tag--${config.color} estado-tag--interactive`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown size={14} className="estado-tag__chevron" />
      </button>

      {isOpen && (
        <div className="estado-tag__dropdown" role="listbox">
          {ESTADOS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`estado-tag__option ${
                opt.id === config.id ? "estado-tag__option--active" : ""
              }`}
              onClick={() => handleEstadoChange(opt.id)}
              role="option"
            >
              <span className={`estado-tag__dot estado-tag__dot--${opt.color}`} />
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./EstadoTag.css";
import type { EstadoOpcion } from "../../../../hooks/useEstados";

const COLOR_MAP: Record<string, string> = {
  activo:    "green",
  disponible:"green",
  reservado: "gray",
  vendido:   "blue",
  inactivo:  "gray",
};

const getColor = (estado: string) => COLOR_MAP[estado.toLowerCase()] ?? "gray";

interface EstadoTagProps {
  estado: string | number;
  canEdit?: boolean;
  estadosDisponibles?: EstadoOpcion[];
  onEstadoChange?: (nuevoEstado: string) => void;
}

export default function EstadoTag({
  estado,
  canEdit = false,
  estadosDisponibles = [],
  onEstadoChange,
}: EstadoTagProps) {
  const [isOpen, setIsOpen] = useState(false);

  const estadoStr = String(estado).toLowerCase();
  const color = getColor(estadoStr);

  const handleEstadoChange = (nuevoEstado: string) => {
    onEstadoChange?.(nuevoEstado);
    setIsOpen(false);
  };

  if (!canEdit) {
    return (
      <span className={`estado-tag estado-tag--${color}`} title={estadoStr}>
        {estadoStr}
      </span>
    );
  }

  return (
    <div className="estado-tag-wrapper">
      <button
        type="button"
        className={`estado-tag estado-tag--${color} estado-tag--interactive`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {estadoStr}
        <ChevronDown size={14} className="estado-tag__chevron" />
      </button>

      {isOpen && estadosDisponibles.length > 0 && (
        <div className="estado-tag__dropdown" role="listbox">
          {estadosDisponibles.map((opt) => (
            <button
              key={opt.id_estado}
              type="button"
              className={`estado-tag__option ${
                opt.estado === estadoStr ? "estado-tag__option--active" : ""
              }`}
              onClick={() => handleEstadoChange(opt.estado)}
              role="option"
            >
              <span className={`estado-tag__dot estado-tag__dot--${getColor(opt.estado)}`} />
              {opt.estado}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

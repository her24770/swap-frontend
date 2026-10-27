"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";

interface FiltroColumnaProps {
  label: string;
  todosLabel: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}

// Botón de encabezado de columna con menú desplegable para filtrar por un valor.
export default function FiltroColumna({ label, todosLabel, options, value, onChange }: FiltroColumnaProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const seleccionar = (nuevoValor: string | null) => {
    onChange(nuevoValor);
    setOpen(false);
  };

  return (
    <div className="tabla-reportes__filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`tabla-reportes__th-filter${value ? " tabla-reportes__th-filter--active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label} <SlidersHorizontal size={11} />
      </button>
      {open && (
        <div className="tabla-reportes__filter-menu">
          <button
            type="button"
            className={`tabla-reportes__filter-option${!value ? " tabla-reportes__filter-option--active" : ""}`}
            onClick={() => seleccionar(null)}
          >
            {todosLabel} {!value && <Check size={12} />}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`tabla-reportes__filter-option${value === opt.value ? " tabla-reportes__filter-option--active" : ""}`}
              onClick={() => seleccionar(opt.value)}
            >
              {opt.label} {value === opt.value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

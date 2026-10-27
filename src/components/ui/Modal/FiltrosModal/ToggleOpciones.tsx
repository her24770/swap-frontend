"use client";

import { Check } from "lucide-react";
import "./ToggleOpciones.css";

interface ToggleOpcionesProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (option: T) => void;
  optionLabel: (option: T) => string;
}

export default function ToggleOpciones<T extends string>({
  label,
  options,
  selected,
  onToggle,
  optionLabel,
}: ToggleOpcionesProps<T>) {
  return (
    <div className="filtros-panel__section">
      <span className="filtros-panel__label">{label}</span>
      <div className="filtros-panel__toggle-row">
        {options.map((op) => (
          <button
            key={op}
            type="button"
            className={`filtros-panel__toggle-btn${selected.includes(op) ? " filtros-panel__toggle-btn--active" : ""}`}
            onClick={() => onToggle(op)}
          >
            <span className="filtros-panel__check-box">
              {selected.includes(op) && <Check size={10} strokeWidth={3} color="white" />}
            </span>
            {optionLabel(op)}
          </button>
        ))}
      </div>
    </div>
  );
}

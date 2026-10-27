"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Check, X } from "lucide-react";
import type { EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import "./EtiquetasFiltro.css";

interface EtiquetasFiltroProps {
  etiquetas: EtiquetaBD[];
  loading: boolean;
  selected: number[];
  onToggle: (id: number) => void;
}

// Selector múltiple de etiquetas con dropdown y chips de las seleccionadas.
export default function EtiquetasFiltro({ etiquetas, loading, selected, onToggle }: EtiquetasFiltroProps) {
  const t = useTranslations("common.filtros");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerLabel = loading
    ? t("loading")
    : selected.length === 0
      ? t("categoriesEmpty")
      : selected.length === 1
        ? t("categoriesOne")
        : t("categoriesMany", { count: selected.length });

  return (
    <div className="filtros-panel__section">
      <span className="filtros-panel__label">{t("etiquetas")}</span>
      <div className="filtros-panel__dropdown" ref={dropdownRef}>
        <button
          type="button"
          disabled={loading}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`filtros-panel__tags-trigger${selected.length > 0 ? " filtros-panel__tags-trigger--has-value" : ""}${dropdownOpen ? " filtros-panel__tags-trigger--open" : ""}`}
        >
          <span>{triggerLabel}</span>
          <ChevronDown
            size={14}
            className={`filtros-panel__chevron${dropdownOpen ? " filtros-panel__chevron--open" : ""}`}
          />
        </button>

        {dropdownOpen && !loading && (
          <div className="filtros-panel__tags-menu">
            {etiquetas.map((e) => {
              const isSelected = selected.includes(e.id_etiqueta);
              return (
                <button
                  key={e.id_etiqueta}
                  type="button"
                  onClick={() => onToggle(e.id_etiqueta)}
                  className={`filtros-panel__tags-option${isSelected ? " filtros-panel__tags-option--selected" : ""}`}
                >
                  <span className={`filtros-panel__tags-checkbox${isSelected ? " filtros-panel__tags-checkbox--checked" : ""}`}>
                    {isSelected && <Check size={9} strokeWidth={3} color="white" />}
                  </span>
                  {e.nombre}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="filtros-panel__tags-list">
          {selected.map((id) => {
            const e = etiquetas.find((et) => et.id_etiqueta === id);
            return e ? (
              <span key={id} className="filtros-panel__tag-pill">
                {e.nombre}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="filtros-panel__tag-remove"
                  aria-label={t("removeTagAria", { name: e.nombre })}
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

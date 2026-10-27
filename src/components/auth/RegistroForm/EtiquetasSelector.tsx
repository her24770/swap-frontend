"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EtiquetaBD } from "../../../hooks/useTodasEtiquetas";

interface EtiquetasSelectorProps {
  etiquetas: EtiquetaBD[];
  loading: boolean;
  /** Error al cargar las etiquetas. */
  loadError: string | null;
  /** Error de validación del formulario. */
  fieldError?: string;
  selected: number[];
  onToggle: (id: number) => void;
}

// Selector múltiple de intereses con dropdown y chips de los seleccionados.
export default function EtiquetasSelector({
  etiquetas,
  loading,
  loadError,
  fieldError,
  selected,
  onToggle,
}: EtiquetasSelectorProps) {
  const t = useTranslations('registro.form');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    ? t("tagsLoading")
    : selected.length === 0
      ? t("tagsPlaceholder")
      : `${selected.length} ${selected.length === 1 ? "categoría seleccionada" : "categorías seleccionadas"}`;

  return (
    <div className="registro-form__field">
      <label className="registro-form__label">{t('tagsLabel')}</label>
      <div ref={dropdownRef} className="registro-form__tags-dropdown">
        <button
          type="button"
          disabled={loading}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={[
            "registro-form__tags-trigger",
            selected.length > 0 ? "registro-form__tags-trigger--has-value" : "",
            dropdownOpen ? "registro-form__tags-trigger--open" : "",
            fieldError ? "registro-form__tags-trigger--error" : "",
          ].join(" ")}
        >
          <span>{triggerLabel}</span>
          <ChevronDown size={16} className={`registro-form__tags-chevron${dropdownOpen ? " registro-form__tags-chevron--open" : ""}`} />
        </button>

        {dropdownOpen && !loading && (
          <div className="registro-form__tags-menu">
            {etiquetas.map((etiqueta) => {
              const isSelected = selected.includes(etiqueta.id_etiqueta);
              return (
                <button
                  key={etiqueta.id_etiqueta}
                  type="button"
                  onClick={() => onToggle(etiqueta.id_etiqueta)}
                  className={`registro-form__tags-option${isSelected ? " registro-form__tags-option--selected" : ""}`}
                >
                  <span className={`registro-form__tags-checkbox${isSelected ? " registro-form__tags-checkbox--checked" : ""}`}>
                    {isSelected && <Check size={11} strokeWidth={3} color="white" />}
                  </span>
                  {etiqueta.nombre}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="registro-form__tags-list">
          {selected.map((id) => {
            const etiqueta = etiquetas.find((e) => e.id_etiqueta === id);
            return etiqueta ? (
              <span key={id} className="registro-form__tag">
                {etiqueta.nombre}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="registro-form__tag-remove"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
      {loadError && (
        <span className="registro-form__error">{loadError}</span>
      )}
      {fieldError && (
        <span className="registro-form__error">{fieldError}</span>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EtiquetaBD } from "../../../../hooks/useTodasEtiquetas";
import "./CategoriasSelector.css";

interface CategoriasSelectorProps {
  etiquetas: EtiquetaBD[];
  selected: number[];
  onToggle: (id: number) => void;
  error?: string;
}

// Selector múltiple de categorías con dropdown y chips de las seleccionadas.
export default function CategoriasSelector({ etiquetas, selected, onToggle, error }: CategoriasSelectorProps) {
  const t = useTranslations("publicacionForm");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al clickear fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerLabel =
    selected.length === 0
      ? t("fields.categoryTriggerEmpty")
      : selected.length === 1
        ? t("fields.categoryTriggerOne")
        : t("fields.categoryTriggerMany", { count: selected.length });

  return (
    <div className="crear-publicacion__field">
      <label className="crear-publicacion__label">{t("fields.category")}</label>
      <div className="crear-publicacion__categories-dropdown" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={[
            "crear-publicacion__categories-trigger",
            selected.length > 0 ? "crear-publicacion__categories-trigger--has-value" : "",
            dropdownOpen ? "crear-publicacion__categories-trigger--open" : "",
            error ? "crear-publicacion__categories-trigger--error" : "",
          ].join(" ")}
        >
          <span>{triggerLabel}</span>
          <ChevronDown
            size={16}
            className={`crear-publicacion__categories-chevron${dropdownOpen ? " crear-publicacion__categories-chevron--open" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="crear-publicacion__categories-menu">
            {etiquetas.map((etiqueta) => {
              const isSelected = selected.includes(etiqueta.id_etiqueta);
              return (
                <button
                  key={etiqueta.id_etiqueta}
                  type="button"
                  onClick={() => onToggle(etiqueta.id_etiqueta)}
                  className={`crear-publicacion__categories-option${isSelected ? " crear-publicacion__categories-option--selected" : ""}`}
                >
                  <span className={`crear-publicacion__categories-checkbox${isSelected ? " crear-publicacion__categories-checkbox--checked" : ""}`}>
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
        <div className="crear-publicacion__categories-tags">
          {selected.map((id) => {
            const etiqueta = etiquetas.find((e) => e.id_etiqueta === id);
            return etiqueta ? (
              <span key={id} className="crear-publicacion__categories-tag">
                {etiqueta.nombre}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="crear-publicacion__categories-tag-remove"
                  aria-label={t("fields.removeTagAria", { tag: etiqueta.nombre })}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {error && <span className="crear-publicacion__error">{error}</span>}
    </div>
  );
}

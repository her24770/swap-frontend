"use client";

import { useTranslations } from "next-intl";
import type { TipoCompraHistorial } from "../../../../types/acuerdo";
import "./HistorialAcuerdos.css";

interface CompraFilterTabsProps {
  value: TipoCompraHistorial;
  onChange?: (filter: TipoCompraHistorial) => void;
}

export default function CompraFilterTabs({ value, onChange }: CompraFilterTabsProps) {
  const t = useTranslations("perfil.history.filters");
  const options: Array<{ key: TipoCompraHistorial; label: string }> = [
    { key: "producto", label: t("all") },
    { key: "material", label: t("materials") },
    { key: "negocio", label: t("businesses") },
  ];

  return (
    <div className="historial-acuerdos__filters" role="tablist" aria-label={t("aria")}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={value === option.key}
          className={`historial-acuerdos__filter-btn${value === option.key ? " historial-acuerdos__filter-btn--active" : ""}`}
          onClick={() => onChange?.(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import "./SearchBar.css";

export interface SearchBarFilterControl {
  isOpen: boolean;
  onToggle: () => void;
  active?: boolean;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filter?: SearchBarFilterControl;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  filter,
}: SearchBarProps) {
  const t = useTranslations("common.search");
  const tFiltros = useTranslations("common.filtros");
  const resolvedPlaceholder = placeholder ?? t("placeholder");

  return (
    <div className={`search-bar${filter ? " search-bar--with-filter" : ""}`}>
      <div className="search-bar__field">
        <input
          type="text"
          className="search-bar__input"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {filter && (
          <button
            type="button"
            className={`search-bar__filter-btn${filter.isOpen ? " search-bar__filter-btn--open" : ""}${filter.active ? " search-bar__filter-btn--active" : ""}`}
            onClick={filter.onToggle}
            aria-expanded={filter.isOpen}
            aria-label={t("filterAria")}
            title={tFiltros("title")}
          >
            <SlidersHorizontal size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

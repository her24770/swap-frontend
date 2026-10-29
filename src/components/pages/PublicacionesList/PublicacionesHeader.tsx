import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import SearchBar from "../../ui/SearchBar/SearchBar";
import FiltrosModal, { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import { getPrecioMax } from "./usePublicacionesFiltros";

type Props = {
    title: string;
    tipo?: TipoFiltro;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    etiquetas: React.ComponentProps<typeof FiltrosModal>["etiquetas"];
    etiquetasLoading: boolean;
    hasActiveFilters: boolean;
    onAplicar: (values: FiltroValues) => void;
    onLimpiar: () => void;
};

// Título, barra de búsqueda y dropdown de filtros.
export default function PublicacionesHeader({
    title,
    tipo,
    searchQuery,
    onSearchChange,
    etiquetas,
    etiquetasLoading,
    hasActiveFilters,
    onAplicar,
    onLimpiar,
}: Props) {
    const tSearch = useTranslations("common.search");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterAnchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isFilterOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsFilterOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (filterAnchorRef.current?.contains(e.target as Node)) return;
            setIsFilterOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFilterOpen]);

    const handleAplicar = (values: FiltroValues) => {
        setIsFilterOpen(false);
        onAplicar(values);
    };

    return (
        <div className="publicaciones-list__header">
            <div className="publicaciones-list__title-actions">
                <h1 className="publicaciones-list__title">{title}</h1>
            </div>
            <div className="publicaciones-list__search-actions" ref={filterAnchorRef}>
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    filter={
                        tipo
                            ? {
                                  isOpen: isFilterOpen,
                                  onToggle: () => setIsFilterOpen((prev) => !prev),
                                  active: hasActiveFilters,
                              }
                            : undefined
                    }
                />
                {isFilterOpen && tipo && (
                    <>
                        <button
                            type="button"
                            className="filtros-dropdown__backdrop"
                            aria-label={tSearch("closeFiltersAria")}
                            onClick={() => setIsFilterOpen(false)}
                        />
                        <div className="filtros-dropdown">
                            <FiltrosModal
                                tipo={tipo}
                                etiquetas={etiquetas}
                                etiquetasLoading={etiquetasLoading}
                                precioMax={getPrecioMax(tipo)}
                                onAplicar={handleAplicar}
                                onLimpiar={onLimpiar}
                                onClose={() => setIsFilterOpen(false)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

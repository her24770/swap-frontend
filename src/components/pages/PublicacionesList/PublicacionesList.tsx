"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../../components/posts/PostCard/PostCard";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import type { Publicacion } from "../../../types/publicacion";
import { Tag } from "../../../types/tag";
import "./PublicacionesList.css";

type Props = {
    title: string;
    recommendedPublicaciones?: Publicacion[];
    recentsPublicaciones?: Publicacion[];
    morePublicaciones?: Publicacion[];
    loading: { recents?: boolean; recommended?: boolean; more?: boolean; global?: boolean };
    errors: { recents?: any; recommended?: any; more?: any };
    itemsPerPage?: number;
    tagsForAll?: (tTags: any) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    currentPage?: number;
    onPageChange?: (page: number) => void;
};

export default function PublicacionesList({
    title,
    recentsPublicaciones = [],
    recommendedPublicaciones = [],
    morePublicaciones = [],
    loading,
    errors,
    itemsPerPage = 12,
    tagsForAll,
    onDetallesClick,
    currentPage: controlledPage,
    onPageChange,
}: Props) {
    const t = useTranslations();
    const tEmpty = useTranslations('common.empty');
    const tTags = useTranslations('common.tags');
    const [searchQuery, setSearchQuery] = useState("");
    const [internalPage, setInternalPage] = useState(1);

    const currentPage = controlledPage ?? internalPage;
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const setCurrentPage = (p: number) => {
        onPageChange ? onPageChange(p) : setInternalPage(p);
    };

    // 1. Unificar para búsquedas (quitando duplicados)
    const allPublicaciones = useMemo(() => {
        const seen = new Set<number>();
        return [...recentsPublicaciones, ...recommendedPublicaciones, ...morePublicaciones].filter((p) => {
            if (seen.has(p.id_publicacion)) return false;
            seen.add(p.id_publicacion);
            return true;
        });
    }, [morePublicaciones, recentsPublicaciones, recommendedPublicaciones]);

    // 2. Filtrado 
    const filtered = useMemo(() => {
        if (!normalizedQuery) return allPublicaciones;
        return allPublicaciones.filter((p) =>
            p.titulo?.toLowerCase().includes(normalizedQuery) ||
            p.descripcion?.toLowerCase().includes(normalizedQuery)
        );
    }, [allPublicaciones, normalizedQuery]);

    const showingSearchResults = normalizedQuery.length > 0;
    
    const mainSectionData = showingSearchResults ? filtered : morePublicaciones;
    const totalPages = Math.ceil(mainSectionData.length / itemsPerPage);
    const paginatedData = mainSectionData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const mapTags = (p: Publicacion) => 
        tagsForAll ? tagsForAll(tTags) : [{ id: 0, name: tTags("negocio"), colorKey: "diseno" }];

    // Helper para renderizar errores pequeños en secciones
    const RenderError = ({ error }: { error: any }) => (
        error ? <p className="publicaciones-list__error-inline">{t("error_loading_section")}</p> : null
    );

    return (
        <main className="publicaciones-list">
            <div className="publicaciones-list__header">
                <h1 className="publicaciones-list__title">{title}</h1>
                <SearchBar value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} />
            </div>

            {/* Estado de carga global (solo si todo está vacío) */}
            {loading.global && allPublicaciones.length === 0 && (
                <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
            )}

            {/* Sin resultados */}
            {!loading.global && filtered.length === 0 && (
                <div className="publicaciones-list__empty">
                    <p>{showingSearchResults ? tEmpty("noResultsFor", { query: searchQuery }) : tEmpty("description")}</p>
                </div>
            )}

            {!showingSearchResults ? (
                <div className="publicaciones-list__sections">
                    {/* SECCIÓN RECIENTES */}
                    <section className="publicaciones-list__section">
                        <h2 className="publicaciones-list__section-title">Publicaciones recientes</h2>
                        <RenderError error={errors.recents} />
                        {loading.recents ? <p>Cargando recientes...</p> : (
                            <div className="publicaciones-list__carousel-wrap">
                                <HorizontalCarousel>
                                    {recentsPublicaciones.map(p => (
                                        <div key={p.id_publicacion} className="h-carousel__item">
                                            <PostCard
                                                tags={mapTags(p)}
                                                title={p.titulo}
                                                price={parseFloat(p.precio)}
                                                description={p.descripcion}
                                                images={p.imagenes.map((img) => img.url_imagen)}
                                                estado={p.estado}
                                                onDetallesClick={() => onDetallesClick && onDetallesClick(p)}
                                            />
                                        </div>
                                    ))}
                                </HorizontalCarousel>
                            </div>
                        )}
                    </section>

                    {/* SECCIÓN RECOMENDADOS */}
                    <section className="publicaciones-list__section">
                        <h2 className="publicaciones-list__section-title">Publicaciones Recomendadas</h2>
                        <RenderError error={errors.recommended} />
                        {loading.recommended ? <p>Buscando sugerencias...</p> : (
                            <div className="publicaciones-list__carousel-wrap">
                                <HorizontalCarousel>
                                    {recommendedPublicaciones.map(p => (
                                        <div key={p.id_publicacion} className="h-carousel__item">
                                            <PostCard
                                                tags={mapTags(p)}
                                                title={p.titulo}
                                                price={parseFloat(p.precio)}
                                                description={p.descripcion}
                                                images={p.imagenes.map((img) => img.url_imagen)}
                                                estado={p.estado}
                                                onDetallesClick={() => onDetallesClick && onDetallesClick(p)}
                                            />
                                        </div>
                                    ))}
                                </HorizontalCarousel>
                            </div>
                        )}
                    </section>

                    <section className="publicaciones-list__section">
                        <h2 className="publicaciones-list__section-title">Explora más</h2>
                        <RenderError error={errors.more} />
                        <div className="publicaciones-list__grid">
                            {paginatedData.map(p => (
                                <PostCard
                                    key={p.id_publicacion}
                                    tags={mapTags(p)}
                                    title={p.titulo}
                                    price={parseFloat(p.precio)}
                                    description={p.descripcion}
                                    images={p.imagenes.map((img) => img.url_imagen)}
                                    estado={p.estado}
                                    onDetallesClick={() => onDetallesClick && onDetallesClick(p)}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <section className="publicaciones-list__search-results">
                    <h2 className="publicaciones-list__section-title">Resultados ({filtered.length})</h2>
                    <div className="publicaciones-list__grid">
                        {paginatedData.map(p => (
                            <PostCard
                                key={p.id_publicacion}
                                tags={mapTags(p)}
                                title={p.titulo}
                                price={parseFloat(p.precio)}
                                description={p.descripcion}
                                images={p.imagenes.map((img) => img.url_imagen)}
                                estado={p.estado}
                                onDetallesClick={() => onDetallesClick && onDetallesClick(p)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* PAGINACIÓN ÚNICA (Sirve para Búsqueda o para "Más") */}
            {totalPages > 1 && (
                <div className="publicaciones-list__pagination">
                    {/* ... lógica de botones de página que ya tenías ... */}
                </div>
            )}
        </main>
    );
}

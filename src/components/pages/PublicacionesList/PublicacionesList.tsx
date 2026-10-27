"use client";
import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../../components/posts/PostCard/PostCard";
import { useDetallePublicacion } from "../../../hooks/useDetallePublicacion";
import { useBusquedaSemantica } from "../../../hooks/fetch/useBusquedaSemantica";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import type { Publicacion, TutorFiltrado } from "../../../types/publicacion";
import { Tag } from "../../../types/tag";
import type { Anuncio } from "../../../types/anuncio";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import type { TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import "../../ui/Button/Button.css";
import "./PublicacionesList.css";
import { SkeletonHorizontalCarousel } from "../../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel";
import { PublicacionesGridSkeleton } from "./PublicacionesGridSkeleton";
import { UserResCardSkeleton } from "../../posts/UserResumida/UserResCardSkeleton/UserResCardSkeleton";
import { AdBannerSkeleton } from "../../perfiles/Vendedor/AdBanner/AdBannerSkeleton/AdBannerSkeleton";
import { ErrorInline, VISIBLE_PAGINATION_PAGES } from "./publicacionesListUtils";
import { usePublicacionesFiltros } from "./usePublicacionesFiltros";
import PublicacionesHeader from "./PublicacionesHeader";
import PublicacionesDetalleModales from "./PublicacionesDetalleModales";
import PublicacionesPagination from "./PublicacionesPagination";
import PostsCarouselSection from "./PostsCarouselSection";
import TutoresCarousel from "./TutoresCarousel";
import TutoresSection from "./TutoresSection";

type Props = {
    title: string;
    tipo?: TipoFiltro;
    recommendedPublicaciones?: Publicacion[];
    recentsPublicaciones?: Publicacion[];
    morePublicaciones?: Publicacion[];
    totalPublicaciones?: number;
    tutores?: TutorFiltrado[];
    currentPage?: number;
    onPageChange?: (page: number) => void;
    popularPublicaciones?: Publicacion[];
    tutoriaPublicaciones?: Publicacion[];
    loading: { recents?: boolean; recommended?: boolean; more?: boolean; global?: boolean; ads?: boolean; popular?: boolean; tutores?: boolean };
    errors: { recents?: unknown; recommended?: unknown; more?: unknown; ads?: unknown; popular?: unknown; tutores?: unknown };
    itemsPerPage?: number;
    tagsForAll?: (tTags: ReturnType<typeof useTranslations<"common.tags">>) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    Ads?: Anuncio[];
    soloLectura?: boolean;
    perfilBasePath?: string;
};

export default function PublicacionesList({
    title,
    tipo,
    recentsPublicaciones = [],
    recommendedPublicaciones = [],
    morePublicaciones = [],
    totalPublicaciones,
    currentPage,
    tutores = [],
    onPageChange,
    popularPublicaciones = [],
    loading,
    errors,
    itemsPerPage = 12,
    tagsForAll,
    onDetallesClick,
    Ads = [],
    soloLectura = false,
    perfilBasePath = "/perfil",
}: Props) {
    const t = useTranslations("seccion");
    const tEmpty = useTranslations("common.empty");
    const tTags = useTranslations("common.tags");
    const tSearch = useTranslations("common.search");
    const [searchQuery, setSearchQuery] = useState("");
    const [internalPage, setInternalPage] = useState(1);
    const [selectedTutor, setSelectedTutor] = useState<TutorFiltrado | null>(null);
    // Publicaciones eliminadas por un moderador desde el detalle: se ocultan sin recargar.
    const [idsEliminados, setIdsEliminados] = useState<Set<number>>(new Set());
    const sinEliminadas = (list: Publicacion[]) =>
        idsEliminados.size === 0 ? list : list.filter((p) => !idsEliminados.has(p.id_publicacion));
    const {
        etiquetas,
        etiquetasLoading,
        filteredResults: filteredResultsRaw,
        filteredTutores,
        filterLoading,
        activeFilters,
        aplicarFiltros,
        limpiarFiltros,
    } = usePublicacionesFiltros(tipo);

    const filteredResults = filteredResultsRaw && sinEliminadas(filteredResultsRaw);
    const { results: searchResultsRaw, loading: searchLoading } = useBusquedaSemantica(searchQuery, tipo);
    const searchResults = sinEliminadas(searchResultsRaw);
    const { selectedPublicacion, loadingDetalle, handleDetallesClick, handleClose } = useDetallePublicacion();

    const handleCardClick = (p: Publicacion) => {
        handleDetallesClick(p);
        if (onDetallesClick) onDetallesClick(p);
    };

    const showingSearchResults = searchQuery.trim().length > 0;
    const showingFilteredTutores = !showingSearchResults && tipo === "tutoria" && filteredTutores !== null;
    const showingFiltered = !showingSearchResults && !showingFilteredTutores && filteredResults !== null;
    const safeRecommendedPublicaciones = sinEliminadas(Array.isArray(recommendedPublicaciones) ? recommendedPublicaciones : []);
    const safeRecentsPublicaciones = sinEliminadas(Array.isArray(recentsPublicaciones) ? recentsPublicaciones : []);
    const safeMorePublicaciones = sinEliminadas(Array.isArray(morePublicaciones) ? morePublicaciones : []);
    const safePopularPublicaciones = sinEliminadas(Array.isArray(popularPublicaciones) ? popularPublicaciones : []);
    const safeAds = Array.isArray(Ads) ? Ads : [];
    const safeTutores = Array.isArray(tutores) ? tutores : [];

    const mainSectionData = showingSearchResults
        ? searchResults
        : showingFiltered
            ? filteredResults!
            : safeMorePublicaciones;

    const usesServerPagination = !showingSearchResults && !showingFiltered && totalPublicaciones !== undefined;
    const totalItems = usesServerPagination ? totalPublicaciones : mainSectionData.length;
    const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const activeCurrentPage = showingSearchResults || showingFiltered || currentPage === undefined ? internalPage : currentPage;
    const safeCurrentPage = Math.min(activeCurrentPage, pageCount);

    const visibleGridData = useMemo(() => {
        if (usesServerPagination) return mainSectionData;
        const startIndex = (safeCurrentPage - 1) * itemsPerPage;
        return mainSectionData.slice(startIndex, startIndex + itemsPerPage);
    }, [mainSectionData, safeCurrentPage, itemsPerPage, usesServerPagination]);

    const paginationPages = useMemo(() => {
        const visiblePages = Math.min(VISIBLE_PAGINATION_PAGES, pageCount);
        const halfWindow = Math.floor(visiblePages / 2);
        let startPage = safeCurrentPage - halfWindow;
        let endPage = startPage + visiblePages - 1;
        if (startPage < 1) {
            startPage = 1;
            endPage = visiblePages;
        }
        if (endPage > pageCount) {
            endPage = pageCount;
            startPage = Math.max(1, endPage - visiblePages + 1);
        }
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }, [pageCount, safeCurrentPage]);

    const hasPagination = totalItems > itemsPerPage;

    // Reinicia la página interna cuando cambian los criterios, sin setState en un effect.
    const [criteriosPrevios, setCriteriosPrevios] = useState({ searchQuery, itemsPerPage, filteredResults: filteredResultsRaw });
    if (
        criteriosPrevios.searchQuery !== searchQuery ||
        criteriosPrevios.itemsPerPage !== itemsPerPage ||
        criteriosPrevios.filteredResults !== filteredResultsRaw
    ) {
        setCriteriosPrevios({ searchQuery, itemsPerPage, filteredResults: filteredResultsRaw });
        setInternalPage(1);
    }

    const mapTags = (p: Publicacion) =>
        tagsForAll
            ? tagsForAll(tTags)
            : mapPublicacionEtiquetasToTags(p.etiquetas, { name: tTags("negocio") });

    const tutorsSectionLoading = Boolean(loading.tutores) && safeTutores.length === 0;
    const showTutorsSection = tipo === "tutoria" && (safeTutores.length > 0 || tutorsSectionLoading);
    const showAdsSection = safeAds.length > 0 || Boolean(loading.ads);
    const showRecommendedSection = Boolean(loading.recommended) || safeRecommendedPublicaciones.length > 0;
    const showPopularSection = Boolean(loading.popular) || safePopularPublicaciones.length > 0;
    const showRecentsSection = Boolean(loading.recents) || safeRecentsPublicaciones.length > 0;
    const isMoreGridLoading = Boolean(loading.more) && visibleGridData.length === 0;
    const isSearchLoading = showingSearchResults && searchLoading;

    const renderPagination = (label: string) => {
        if (!hasPagination) return null;
        const setPage = showingSearchResults || showingFiltered || !onPageChange ? setInternalPage : onPageChange;
        return (
            <PublicacionesPagination
                label={label}
                currentPage={safeCurrentPage}
                pageCount={pageCount}
                pages={paginationPages}
                onPageChange={setPage}
            />
        );
    };

    const renderPostCard = (p: Publicacion) => (
        <PostCard
            key={p.id_publicacion}
            soloLectura={soloLectura}
            publicacionId={p.id_publicacion}
            tags={mapTags(p)}
            title={p.titulo}
            price={parseFloat(p.precio)}
            description={p.descripcion}
            images={p.imagenes.map((img) => img.url_imagen)}
            estado={p.estado}
            onDetallesClick={() => handleCardClick(p)}
            initialLikeado={p.likeado ?? false}
            initialLikes={p.me_gusta}
        />
    );

    return (
        <div className="publicaciones-list">
            <PublicacionesHeader
                title={title}
                tipo={tipo}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                etiquetas={etiquetas}
                etiquetasLoading={etiquetasLoading}
                hasActiveFilters={activeFilters !== null}
                onAplicar={aplicarFiltros}
                onLimpiar={limpiarFiltros}
            />

            <div className="publicaciones-list__content">
                {!showingSearchResults &&
                    !showingFiltered &&
                    !showingFilteredTutores &&
                    !loading.global &&
                    safeMorePublicaciones.length === 0 &&
                    !showRecommendedSection &&
                    !showPopularSection &&
                    !showRecentsSection &&
                    !showAdsSection && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("description")}</p>
                        </div>
                    )}

                {showingSearchResults ? (
                    <section className="publicaciones-list__search-results">
                        <h2 className="publicaciones-list__section-title">
                            {isSearchLoading
                                ? tSearch("searching")
                                : t("resultsTitle", { count: searchResults.length })}
                        </h2>
                        {isSearchLoading ? (
                            <PublicacionesGridSkeleton count={itemsPerPage} />
                        ) : searchResults.length === 0 ? (
                            <div className="publicaciones-list__empty">
                                <p>{tEmpty("noResultsFor", { query: searchQuery })}</p>
                            </div>
                        ) : (
                            <>
                                <div className="publicaciones-list__grid">
                                    {visibleGridData.map(renderPostCard)}
                                </div>
                                {renderPagination(t("pagination.results"))}
                            </>
                        )}
                    </section>
                ) : showingFilteredTutores ? (
                    <section className="publicaciones-list__search-results">
                        <h2 className="publicaciones-list__section-title">
                            {filterLoading
                                ? tSearch("searching")
                                : t("resultsTitle", { count: filteredTutores!.length })}
                        </h2>
                        {filterLoading ? (
                            <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                <SkeletonHorizontalCarousel count={4} renderItem={() => <UserResCardSkeleton />} />
                            </div>
                        ) : filteredTutores!.length === 0 ? (
                            <div className="publicaciones-list__empty">
                                <p>{tEmpty("description")}</p>
                            </div>
                        ) : (
                            <TutoresCarousel tutores={filteredTutores!} onSelectTutor={setSelectedTutor} />
                        )}
                    </section>
                ) : showingFiltered ? (
                    <section className="publicaciones-list__search-results">
                        <h2 className="publicaciones-list__section-title">
                            {filterLoading
                                ? tSearch("searching")
                                : t("resultsTitle", { count: filteredResults!.length })}
                        </h2>
                        {filterLoading ? (
                            <PublicacionesGridSkeleton count={itemsPerPage} />
                        ) : filteredResults!.length === 0 ? (
                            <div className="publicaciones-list__empty">
                                <p>{tEmpty("description")}</p>
                            </div>
                        ) : (
                            <>
                                <div className="publicaciones-list__grid">
                                    {visibleGridData.map(renderPostCard)}
                                </div>
                                {renderPagination(t("pagination.filteredResults"))}
                            </>
                        )}
                    </section>
                ) : (
                    <div className="publicaciones-list__sections">
                        {showAdsSection && (
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t("ads")}</h2>
                                <ErrorInline message={t("error_loading_section")} error={errors.ads} />
                                {loading.ads ? (
                                    <AdBannerSkeleton />
                                ) : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <AnunciosCarousel>
                                            {safeAds.map((ad, index) => (
                                                <div key={index} className="h-carousel__item">
                                                    <AdBanner
                                                        imageUrl={ad.imagen_url}
                                                        title={ad.titulo}
                                                        description={ad.descripcion}
                                                    />
                                                </div>
                                            ))}
                                        </AnunciosCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        {showRecommendedSection && (
                            <PostsCarouselSection
                                title={t("recomendado")}
                                errorMessage={t("error_loading_section")}
                                error={errors.recommended}
                                loading={Boolean(loading.recommended)}
                                publicaciones={safeRecommendedPublicaciones}
                                renderPostCard={renderPostCard}
                            />
                        )}

                        {showPopularSection && (
                            <PostsCarouselSection
                                title={t("populares")}
                                errorMessage={t("error_loading_section")}
                                error={errors.popular}
                                loading={Boolean(loading.popular)}
                                publicaciones={safePopularPublicaciones}
                                renderPostCard={renderPostCard}
                            />
                        )}

                        {showTutorsSection && (
                            <TutoresSection
                                tutores={safeTutores}
                                loading={tutorsSectionLoading}
                                error={errors.tutores ?? errors.popular ?? errors.recents}
                                onSelectTutor={setSelectedTutor}
                            />
                        )}

                        {showRecentsSection && (
                            <PostsCarouselSection
                                title={t("reciente")}
                                errorMessage={t("error_loading_section")}
                                error={errors.recents}
                                loading={Boolean(loading.recents)}
                                publicaciones={safeRecentsPublicaciones}
                                renderPostCard={renderPostCard}
                            />
                        )}

                        <section className="publicaciones-list__section">
                            <h2 className="publicaciones-list__section-title">{t("explorar")}</h2>
                            <ErrorInline message={t("error_loading_section")} error={errors.more} />
                            {isMoreGridLoading ? (
                                <PublicacionesGridSkeleton count={itemsPerPage} />
                            ) : (
                                <>
                                    <div className="publicaciones-list__grid">
                                        {visibleGridData.map(renderPostCard)}
                                    </div>
                                    {renderPagination(t("pagination.posts"))}
                                </>
                            )}
                        </section>
                    </div>
                )}
            </div>

            <PublicacionesDetalleModales
                selectedPublicacion={selectedPublicacion}
                loadingDetalle={loadingDetalle}
                onClosePublicacion={handleClose}
                onPublicacionEliminada={(id) => setIdsEliminados((prev) => new Set(prev).add(id))}
                selectedTutor={selectedTutor}
                onCloseTutor={() => setSelectedTutor(null)}
                soloLectura={soloLectura}
                perfilBasePath={perfilBasePath}
            />
        </div>
    );
}

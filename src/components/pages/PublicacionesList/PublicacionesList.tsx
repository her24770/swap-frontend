"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { stripLocalePrefix } from "../../../i18n/pathname";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostCard from "../../../components/posts/PostCard/PostCard";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import { useDetallePublicacion } from "../../../hooks/useDetallePublicacion";
import { useBusquedaSemantica } from "../../../hooks/fetch/useBusquedaSemantica";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import DetalleUsuario from "../../../components/ui/Modal/DetalleUsuario/DetalleUsuario";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import { normalizeImageUrl } from "../../../lib/imageUrl";
import type { Publicacion, FiltroPublicacionBody, FiltroTutorBody, TutorFiltrado } from "../../../types/publicacion";
import { Tag } from "../../../types/tag";
import type { Anuncio } from "../../../types/anuncio";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import FiltrosModal, { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import { useServices } from "../../../services/context/ServiceContext";
import "../../ui/Button/Button.css";
import "./PublicacionesList.css";
import UserResCard from "../../posts/UserResumida/UserResCard";
import { SkeletonHorizontalCarousel } from "../../ui/HorizontalCarousel/SkeletonHorizontalCarousel/SkeletonHorizontalCarousel";
import { PublicacionesGridSkeleton } from "./PublicacionesGridSkeleton";
import { UserResCardSkeleton } from "../../posts/UserResumida/UserResCardSkeleton/UserResCardSkeleton";
import { AdBannerSkeleton } from "../../perfiles/Vendedor/AdBanner/AdBannerSkeleton/AdBannerSkeleton";

const VISIBLE_PAGINATION_PAGES = 5;

function toStarRating(calificacion: number | null | undefined): number {
    return Math.min(5, Math.max(0, Math.round(calificacion ?? 0)));
}

function toVisualStarRating(calificacion: number | null | undefined): number {
    if (calificacion != null && calificacion > 0) {
        return toStarRating(calificacion);
    }
    return 4;
}

type Props = {
    title: string;
    tipo?: TipoFiltro;
    recommendedPublicaciones?: Publicacion[];
    recentsPublicaciones?: Publicacion[];
    morePublicaciones?: Publicacion[];
    totalPublicaciones?: number;
    tutores?: any[];
    currentPage?: number;
    onPageChange?: (page: number) => void;
    popularPublicaciones?: Publicacion[];
    tutoriaPublicaciones?: Publicacion[];
    loading: { recents?: boolean; recommended?: boolean; more?: boolean; global?: boolean; ads?: boolean; popular?: boolean; tutores?: boolean };
    errors: { recents?: any; recommended?: any; more?: any; ads?: any; popular?: any; tutores?: any };
    itemsPerPage?: number;
    tagsForAll?: (tTags: any) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    Ads?: Anuncio[];
    showPersonalizedRecommendationsButton?: boolean;
    soloLectura?: boolean;
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
    showPersonalizedRecommendationsButton = false,
    soloLectura = false,
}: Props) {
    const t = useTranslations("seccion");
    const tEmpty = useTranslations("common.empty");
    const tTags = useTranslations("common.tags");
    const tSearch = useTranslations("common.search");
    const router = useRouter();
    const pathname = stripLocalePrefix(usePathname());
    const isDescubreRoute = pathname === "/" || pathname === "/descubre";
    const showRecommendationsButton =
        showPersonalizedRecommendationsButton || isDescubreRoute;
    const { publicacion: service } = useServices();
    const [searchQuery, setSearchQuery] = useState("");
    const [internalPage, setInternalPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
    const filterAnchorRef = useRef<HTMLDivElement>(null);
    const { etiquetas, loading: etiquetasLoading } = useTodasEtiquetas();
    const [filteredResults, setFilteredResults] = useState<Publicacion[] | null>(null);
    const [filteredTutores, setFilteredTutores] = useState<TutorFiltrado[] | null>(null);
    const [filterLoading, setFilterLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FiltroValues | null>(null);

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

    const { results: searchResults, loading: searchLoading } = useBusquedaSemantica(searchQuery, tipo);
    const { selectedPublicacion, loadingDetalle, handleDetallesClick, handleClose } = useDetallePublicacion();

    const handleCardClick = (p: Publicacion) => {
        handleDetallesClick(p);
        if (onDetallesClick) onDetallesClick(p);
    };

    const showingSearchResults = searchQuery.trim().length > 0;
    const showingFilteredTutores = !showingSearchResults && tipo === "tutoria" && filteredTutores !== null;
    const showingFiltered = !showingSearchResults && !showingFilteredTutores && filteredResults !== null;
    const safeRecommendedPublicaciones = Array.isArray(recommendedPublicaciones) ? recommendedPublicaciones : [];
    const safeRecentsPublicaciones = Array.isArray(recentsPublicaciones) ? recentsPublicaciones : [];
    const safeMorePublicaciones = Array.isArray(morePublicaciones) ? morePublicaciones : [];
    const safePopularPublicaciones = Array.isArray(popularPublicaciones) ? popularPublicaciones : [];
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

    useEffect(() => {
        setInternalPage(1);
    }, [searchQuery, itemsPerPage, filteredResults]);

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

    const navigateToTutorProfile = (userId: number) => {
        setSelectedTutor(null);
        router.push(`/perfil/${userId}?modo=tutor`);
    };

    const RenderError = ({ error }: { error: any }) =>
        error ? <p className="publicaciones-list__error-inline">{t("error_loading_section")}</p> : null;

    const findEtiquetaId = useCallback(
        (nombre: string) =>
            etiquetas.find((e) => e.nombre.toLowerCase() === nombre.toLowerCase())?.id_etiqueta,
        [etiquetas],
    );

    const handleAplicarFiltros = useCallback(
        async (values: FiltroValues) => {
            if (!tipo) return;
            setIsFilterOpen(false);
            setActiveFilters(values);
            setFilterLoading(true);
            const etiquetasIds = [...values.etiquetas];
            if (tipo === "negocio" && values.tipoNegocio?.length === 1) {
                const id = findEtiquetaId(values.tipoNegocio[0] === "producto" ? "Producto" : "Servicio");
                if (id) etiquetasIds.push(id);
            }
            if (tipo === "material" && values.tipoMaterial?.length === 1) {
                const id = findEtiquetaId(values.tipoMaterial[0] === "compra" ? "Compra" : "Alquiler");
                if (id) etiquetasIds.push(id);
            }
            if (tipo === "tutoria") {
                const tutorBody: FiltroTutorBody = {
                    etiquetas: etiquetasIds.length > 0 ? etiquetasIds : undefined,
                    precio_min: values.precioMin > 0 ? values.precioMin : undefined,
                    precio_max: values.precioMax < 200 ? values.precioMax : undefined,
                    calificacion_min: values.calificacionMin > 0 ? values.calificacionMin : undefined,
                    calificacion_max: values.calificacionMax < 5 ? values.calificacionMax : undefined,
                    dias: values.dias && values.dias.length > 0 ? values.dias : undefined,
                    hora_inicio: values.horaDesde !== "07:00" ? values.horaDesde : undefined,
                    hora_final: values.horaHasta !== "20:00" ? values.horaHasta : undefined,
                    limit: 100,
                };
                try {
                    const result = await service.getFiltradasTutorias(tutorBody);
                    setFilteredTutores(result);
                } catch {
                    setFilteredTutores([]);
                } finally {
                    setFilterLoading(false);
                }
                return;
            }

            const body: FiltroPublicacionBody = {
                tipo,
                etiquetas: etiquetasIds.length > 0 ? etiquetasIds : undefined,
                precio_min: values.precioMin > 0 ? values.precioMin : undefined,
                precio_max: values.precioMax < 1000 ? values.precioMax : undefined,
                calificacion_min: values.calificacionMin > 0 ? values.calificacionMin : undefined,
                calificacion_max: values.calificacionMax < 5 ? values.calificacionMax : undefined,
                limit: 100,
            };
            try {
                const result =
                    tipo === "negocio"
                        ? await service.getFiltradasNegocios(body)
                        : await service.getFiltradasMateriales(body);
                setFilteredResults(result);
            } catch {
                setFilteredResults([]);
            } finally {
                setFilterLoading(false);
            }
        },
        [tipo, findEtiquetaId, service],
    );

    const handleLimpiarFiltros = useCallback(() => {
        setFilteredResults(null);
        setFilteredTutores(null);
        setActiveFilters(null);
    }, []);

    const renderPagination = (label: string) => {
        if (!hasPagination) return null;
        const setPage = showingSearchResults || showingFiltered || !onPageChange ? setInternalPage : onPageChange;
        return (
            <div className="publicaciones-list__pagination" aria-label={label}>
                <button
                    className="publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow"
                    type="button"
                    aria-label={t("pagination.previous")}
                    disabled={safeCurrentPage === 1}
                    onClick={() => setPage(Math.max(safeCurrentPage - 1, 1))}
                >
                    <ChevronLeft size={16} aria-hidden />
                </button>
                {paginationPages.map((page) => (
                    <button
                        key={page}
                        className={`publicaciones-list__pagination-btn${page === safeCurrentPage ? " publicaciones-list__pagination-btn--active" : ""}`}
                        type="button"
                        aria-current={page === safeCurrentPage ? "page" : undefined}
                        onClick={() => setPage(page)}
                    >
                        {page}
                    </button>
                ))}
                <button
                    className="publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow"
                    type="button"
                    aria-label={t("pagination.next")}
                    disabled={safeCurrentPage === pageCount}
                    onClick={() => setPage(Math.min(safeCurrentPage + 1, pageCount))}
                >
                    <ChevronRight size={16} aria-hidden />
                </button>
            </div>
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

    const handlePersonalizedRecommendationsClick = () => {
        setSearchQuery("");
        setFilteredResults(null);
        setFilteredTutores(null);
        setActiveFilters(null);
        setInternalPage(1);
    };


    return (
        <div className="publicaciones-list">
            <div className="publicaciones-list__header">
                <div className="publicaciones-list__title-actions">
                    <h1 className="publicaciones-list__title">{title}</h1>
                    {showRecommendationsButton && (
                        <button
                            type="button"
                            className="button button--small"
                            onClick={handlePersonalizedRecommendationsClick}
                        >
                            {t("personalizedRecommendationsButton")}
                        </button>
                    )}
                </div>
                <div className="publicaciones-list__search-actions" ref={filterAnchorRef}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        filter={
                            tipo
                                ? {
                                      isOpen: isFilterOpen,
                                      onToggle: () => setIsFilterOpen((prev) => !prev),
                                      active: activeFilters !== null,
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
                                    precioMax={tipo === "tutoria" ? 200 : 1000}
                                    onAplicar={handleAplicarFiltros}
                                    onLimpiar={handleLimpiarFiltros}
                                    onClose={() => setIsFilterOpen(false)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

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
                            <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                <HorizontalCarousel showPagination={false}>
                                    {filteredTutores!.map((tutor) => (
                                        <div key={tutor.id_usuario} className="h-carousel__item">
                                            <UserResCard
                                                userId={tutor.id_usuario}
                                                userName={tutor.nombre}
                                                userRating={toVisualStarRating(tutor.calificacion)}
                                                userImageUrl={
                                                    tutor.url_foto_perfil
                                                        ? normalizeImageUrl(tutor.url_foto_perfil)
                                                        : undefined
                                                }
                                                onDetallesClick={() => setSelectedTutor(tutor)}
                                            />
                                        </div>
                                    ))}
                                </HorizontalCarousel>
                            </div>
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
                                <RenderError error={errors.ads} />
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
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t("recomendado")}</h2>
                                <RenderError error={errors.recommended} />
                                {loading.recommended ? (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <SkeletonHorizontalCarousel count={4} />
                                    </div>
                                ) : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel showPagination={false}>
                                            {safeRecommendedPublicaciones.map((p) => (
                                                <div key={p.id_publicacion} className="h-carousel__item">
                                                    {renderPostCard(p)}
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        {showPopularSection && (
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t("populares")}</h2>
                                <RenderError error={errors.popular} />
                                {loading.popular ? (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <SkeletonHorizontalCarousel count={4} />
                                    </div>
                                ) : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel showPagination={false}>
                                            {safePopularPublicaciones.map((p) => (
                                                <div key={p.id_publicacion} className="h-carousel__item">
                                                    {renderPostCard(p)}
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        {showTutorsSection && (
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t("tutores")}</h2>
                                <RenderError error={errors.tutores ?? errors.popular ?? errors.recents} />
                                {tutorsSectionLoading ? (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <SkeletonHorizontalCarousel count={4} renderItem={() => <UserResCardSkeleton />} />
                                    </div>
                                ) : safeTutores.length === 0 ? (
                                    <p>{t("noTutores")}</p>
                                ) : (
                                    <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                        <HorizontalCarousel showPagination={false}>
                                            {safeTutores.map((tutor) => (
                                                <div key={tutor.id_usuario} className="h-carousel__item">
                                                    <UserResCard
                                                        userId={tutor.id_usuario}
                                                        userName={tutor.nombre}
                                                        userRating={toVisualStarRating(tutor.calificacion)}
                                                        userImageUrl={
                                                            tutor.url_foto_perfil
                                                                ? normalizeImageUrl(tutor.url_foto_perfil)
                                                                : undefined
                                                        }
                                                        onDetallesClick={() => setSelectedTutor(tutor)}
                                                    />
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        {showRecentsSection && (
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t("reciente")}</h2>
                                <RenderError error={errors.recents} />
                                {loading.recents ? (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <SkeletonHorizontalCarousel count={4} />
                                    </div>
                                ) : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel showPagination={false}>
                                            {safeRecentsPublicaciones.map((p) => (
                                                <div key={p.id_publicacion} className="h-carousel__item">
                                                    {renderPostCard(p)}
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        <section className="publicaciones-list__section">
                            <h2 className="publicaciones-list__section-title">{t("explorar")}</h2>
                            <RenderError error={errors.more} />
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

            {selectedPublicacion && (
                <DetallePublicacion
                    soloLectura={soloLectura}
                    isOpen={true}
                    onClose={handleClose}
                    type={selectedPublicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
                    title={selectedPublicacion.titulo}
                    price={parseFloat(selectedPublicacion.precio)}
                    description={selectedPublicacion.descripcion}
                    imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
                    images={selectedPublicacion.imagenes.map((img) => img.url_imagen)}
                    tags={mapPublicacionEtiquetasToTags(selectedPublicacion.etiquetas, {
                        name: selectedPublicacion.tipoPerfil?.tipo_perfil ?? tTags("negocio"),
                    })}
                    likes={selectedPublicacion.me_gusta}
                    publicacionId={selectedPublicacion.id_publicacion}
                    sellerName={loadingDetalle ? t("loading") : (selectedPublicacion.usuario.nombre ?? "Usuario SWAP")}
                    sellerRating={selectedPublicacion.usuario.calificacion ?? 0}
                    sellerId={selectedPublicacion.usuario.id_usuario}
                    sellerImageUrl={selectedPublicacion.usuario.url_foto_perfil}
                    estado={selectedPublicacion.estadoRel?.estado}
                    onSellerClick={(sellerId) => {
                        handleClose();
                        router.push(`/perfil/${sellerId}?modo=tutor`);
                    }}
                    onVerCertificados={() => console.log("ver certificados")}
                    onSolicitarTutoria={() => console.log("solicitar tutoría")}
                />
            )}

            {selectedTutor && (
                <DetalleUsuario
                    isOpen
                    onClose={() => setSelectedTutor(null)}
                    userId={selectedTutor.id_usuario}
                    userName={selectedTutor.nombre}
                    userRating={toVisualStarRating(selectedTutor.calificacion)}
                    userImageUrl={
                        selectedTutor.url_foto_perfil
                            ? normalizeImageUrl(selectedTutor.url_foto_perfil)
                            : undefined
                    }
                    temas={selectedTutor.publicaciones?.map((p: any) => p.titulo) || []}
                    tags={[
                        ...(selectedTutor.etiquetas?.map((e: any) => ({
                            id: e.etiqueta.id_etiqueta,
                            name: e.etiqueta.nombre,
                            parentId: e.etiqueta.id_etiqueta_padre,
                        })) || []),
                    ]}
                    onVerCertificados={() => navigateToTutorProfile(selectedTutor.id_usuario)}
                    onVerPerfil={navigateToTutorProfile}
                />
            )}
        </div>
    );
}

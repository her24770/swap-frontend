"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import type {Anuncio} from "../../../types/anuncio";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import FiltrosModal, { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import { useServices } from "../../../services/context/ServiceContext";
import "./PublicacionesList.css";
import UserResCard from "../../posts/UserResumida/UserResCard";


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
    /** Optional extra tutoria publications for the tutors carousel (merged with recents/popular/more when tipo is tutoria). */
    tutoriaPublicaciones?: Publicacion[];
    loading: { recents?: boolean; recommended?: boolean; more?: boolean; global?: boolean; ads?: boolean; popular?: boolean; tutores?: boolean };
    errors: { recents?: any; recommended?: any; more?: any; ads?: any; popular?: any; tutores?: any };
    itemsPerPage?: number;
    tagsForAll?: (tTags: any) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    Ads?: Anuncio[];
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
    tutoriaPublicaciones = [],
    loading,
    errors,
    itemsPerPage = 12,
    tagsForAll,
    onDetallesClick,
    Ads = [],
}: Props) {
    const t = useTranslations('seccion');
    const tEmpty = useTranslations('common.empty');
    const tTags = useTranslations('common.tags');
    const tSearch = useTranslations('common.search');
    const router = useRouter();
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

    const {
        selectedPublicacion,
        loadingDetalle,
        handleDetallesClick,
        handleClose,
    } = useDetallePublicacion();

    const handleCardClick = (p: Publicacion) => {
        handleDetallesClick(p);
        if (onDetallesClick) onDetallesClick(p);
    };

    const showingSearchResults = searchQuery.trim().length > 0;
    const showingFilteredTutores = !showingSearchResults && tipo === "tutoria" && filteredTutores !== null;
    const showingFiltered = !showingSearchResults && !showingFilteredTutores && filteredResults !== null;

    const mainSectionData = showingSearchResults
        ? searchResults
        : showingFiltered
            ? filteredResults!
            : morePublicaciones;
    const usesServerPagination = !showingSearchResults && !showingFiltered && totalPublicaciones !== undefined;
    const totalItems = usesServerPagination ? totalPublicaciones : mainSectionData.length;
    const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const activeCurrentPage = showingSearchResults || currentPage === undefined ? internalPage : currentPage;
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

        return Array.from(
            { length: endPage - startPage + 1 },
            (_, index) => startPage + index
        );
    }, [pageCount, safeCurrentPage]);
    const hasPagination = totalItems > itemsPerPage;

    useEffect(() => {
        setInternalPage(1);
    }, [searchQuery, itemsPerPage]);

    const mapTags = (p: Publicacion) =>
        tagsForAll
            ? tagsForAll(tTags)
            : mapPublicacionEtiquetasToTags(p.etiquetas, { name: tTags("negocio") });

    const tutorsSectionLoading =
        Boolean(loading.tutores) && tutores.length === 0;

    const showTutorsSection =
    tipo === "tutoria" &&
    tutores.length > 0;

    const navigateToTutorProfile = (userId: number) => {
        setSelectedTutor(null);
        router.push(`/perfil/${userId}?modo=tutor`);
    };

    const RenderError = ({ error }: { error: any }) => (
        error ? <p className="publicaciones-list__error-inline">{t("error_loading_section")}</p> : null
    );

    const findEtiquetaId = useCallback((nombre: string) => {
        return etiquetas.find(e => e.nombre.toLowerCase() === nombre.toLowerCase())?.id_etiqueta;
    }, [etiquetas]);

    const handleAplicarFiltros = useCallback(async (values: FiltroValues) => {
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
            // Para tutorías el endpoint es distinto — devuelve tutores
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

        const precioMaxDefault = 1000;

        const body: FiltroPublicacionBody = {
            tipo,
            etiquetas: etiquetasIds.length > 0 ? etiquetasIds : undefined,
            precio_min: values.precioMin > 0 ? values.precioMin : undefined,
            precio_max: values.precioMax < precioMaxDefault ? values.precioMax : undefined,
            calificacion_min: values.calificacionMin > 0 ? values.calificacionMin : undefined,
            calificacion_max: values.calificacionMax < 5 ? values.calificacionMax : undefined,
            limit: 100,
        };

        try {
            let result: Publicacion[];
            if (tipo === "negocio") result = await service.getFiltradasNegocios(body);
            else result = await service.getFiltradasMateriales(body);
            setFilteredResults(result);
        } catch {
            setFilteredResults([]);
        } finally {
            setFilterLoading(false);
        }
    }, [tipo, etiquetas, findEtiquetaId, service]);

    const handleLimpiarFiltros = useCallback(() => {
        setFilteredResults(null);
        setFilteredTutores(null);
        setActiveFilters(null);
    }, []);

    const renderPagination = (label: string) => {
        if (!hasPagination) return null;

        const setPage = showingSearchResults || !onPageChange ? setInternalPage : onPageChange;

        return (
            <div className="publicaciones-list__pagination" aria-label={label}>
                <button
                    className="publicaciones-list__pagination-btn publicaciones-list__pagination-btn--arrow"
                    type="button"
                    aria-label="Página anterior"
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
                    aria-label="Página siguiente"
                    disabled={safeCurrentPage === pageCount}
                    onClick={() => setPage(Math.min(safeCurrentPage + 1, pageCount))}
                >
                    <ChevronRight size={16} aria-hidden />
                </button>
            </div>
        );
    };

    const handleDetailsClick = () => {
    setSearchQuery("");
    };

    return (
        <main className="publicaciones-list">
            <div className="publicaciones-list__header">
                <div className="publicaciones-list__title-actions">
                    <h1 className="publicaciones-list__title">{title}</h1>
                    <button
                    type="button"
                    className="button button--small"
                    onClick={handleDetailsClick}
                    >
                        Recomendados para ti
                    </button>
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
                    {/* Estado de carga global */}
                    {(loading.global && !showingSearchResults && !showingFiltered) && morePublicaciones.length === 0 && (
                        <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
                    )}
                    {showingSearchResults && searchLoading && (
                        <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
                    )}
                    {(showingFiltered || showingFilteredTutores) && filterLoading && (
                        <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
                    )}

                    {showingSearchResults && !searchLoading && searchResults.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("noResultsFor", { query: searchQuery })}</p>
                        </div>
                    )}

                    {showingFiltered && !filterLoading && filteredResults!.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("description")}</p>
                        </div>
                    )}

                    {showingFilteredTutores && !filterLoading && filteredTutores!.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("description")}</p>
                        </div>
                    )}

                    {!showingSearchResults && !showingFiltered && !showingFilteredTutores && !loading.global && morePublicaciones.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("description")}</p>
                        </div>
                    )}

                    {showingSearchResults ? (
                        /* RESULTADOS DE BÚSQUEDA */
                        <section className="publicaciones-list__search-results">
                            <h2 className="publicaciones-list__section-title">Resultados ({searchResults.length})</h2>
                            <div className="publicaciones-list__grid">
                                {searchResults.map(p => (
                                    <PostCard
                                        key={p.id_publicacion}
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
                                ))}
                            </div>
                        </section>
                    ) : showingFilteredTutores ? (
                        /* TUTORES FILTRADOS */
                        <section className="publicaciones-list__search-results">
                            <h2 className="publicaciones-list__section-title">Resultados ({filteredTutores!.length})</h2>
                            <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                <HorizontalCarousel showPagination={false}>
                                    {filteredTutores!.map((tutor) => (
                                        <div key={tutor.id_usuario} className="h-carousel__item">
                                            <UserResCard
                                                userId={tutor.id_usuario}
                                                userName={tutor.nombre}
                                                userRating={toVisualStarRating(tutor.calificacion)}
                                                userImageUrl={tutor.url_foto_perfil ? normalizeImageUrl(tutor.url_foto_perfil) : undefined}
                                                onDetallesClick={() => setSelectedTutor(tutor)}
                                            />
                                        </div>
                                    ))}
                                </HorizontalCarousel>
                            </div>
                        </section>
                    ) : showingFiltered ? (
                        /* RESULTADOS FILTRADOS (negocios/materiales) */
                        <section className="publicaciones-list__search-results">
                            <h2 className="publicaciones-list__section-title">Resultados ({filteredResults!.length})</h2>
                            <div className="publicaciones-list__grid">
                                {visibleGridData.map(p => (
                                    <PostCard
                                        key={p.id_publicacion}
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
                                ))}
                            </div>
                            {renderPagination("Paginación de resultados filtrados")}
                        </section>
                    ) : (
                        <div className="publicaciones-list__sections">
        
                        {/* SECCIÓN ADS si el arreglo no está vacío */}
                        {Ads.length > 0 && (    
                        
                        <section className="publicaciones-list__section">
                            <h2 className="publicaciones-list__section-title">{t('ads')}</h2>
                            <RenderError error={errors.ads} />
                            {loading.ads ? <p>Cargando anuncios...</p> : (
                                <div className="publicaciones-list__carousel-wrap">
                                    <AnunciosCarousel>
                                        {Ads.map((ad, index) => (
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


                        {/* SECCIÓN RECOMENDADOS */}
                        {recommendedPublicaciones.length > 0 &&(
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t('recomendado')}</h2>
                                <RenderError error={errors.recommended} />
                                {loading.recommended ? <p>Buscando sugerencias...</p> : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel showPagination={false}>
                                            {recommendedPublicaciones.map(p => (
                                                <div key={p.id_publicacion} className="h-carousel__item">
                                                    <PostCard
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
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* SECCIÓN POPULARES */}
                        {popularPublicaciones.length > 0 && (
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t('populares')}</h2>
                                <RenderError error={errors.popular} />
                                {loading.popular ? <p>Buscando sugerencias...</p> : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel showPagination={false}>
                                            {popularPublicaciones.map(p => (
                                                <div key={p.id_publicacion} className="h-carousel__item">
                                                    <PostCard
                                                        publicacionId={p.id_publicacion}
                                                        tags={mapTags(p)}
                                                        title={p.titulo}
                                                        price={parseFloat(p.precio)}
                                                        description={p.descripcion}
                                                        images={p.imagenes.map((img) => img.url_imagen)}
                                                        estado={p.estado}
                                                        onDetallesClick={() => handleCardClick(p)}
                                                    />
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>
                        )}

                            {/* SECCIÓN TUTORES */}
                            {showTutorsSection && (
                                <section className="publicaciones-list__section">
                                    <h2 className="publicaciones-list__section-title">{t("tutores")}</h2>
                                    <RenderError error={errors.tutores ?? errors.popular ?? errors.recents} />
                                    {tutorsSectionLoading ? (
                                        <p>{t("loadingTutores")}</p>
                                    ) : tutores.length === 0 ? (
                                        <p>{t("noTutores")}</p>
                                    ) : (
                                        <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                            <HorizontalCarousel showPagination={false}>
                                                {tutores.map((tutor) => (
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

                            {/* SECCIÓN RECIENTES */}
                            { recentsPublicaciones.length > 0 && (
                                <section className="publicaciones-list__section">
                                    <h2 className="publicaciones-list__section-title">{t('reciente')}</h2>
                                    <RenderError error={errors.recents} />
                                    {loading.recents ? <p>Cargando recientes...</p> : (
                                        <div className="publicaciones-list__carousel-wrap">
                                            <HorizontalCarousel showPagination={false}>
                                                {recentsPublicaciones.map(p => (
                                                    <div key={p.id_publicacion} className="h-carousel__item">
                                                        <PostCard
                                                            publicacionId={p.id_publicacion}
                                                            tags={mapTags(p)}
                                                            title={p.titulo}
                                                            price={parseFloat(p.precio)}
                                                            description={p.descripcion}
                                                            images={p.imagenes.map((img) => img.url_imagen)}
                                                            estado={p.estado}
                                                            onDetallesClick={() => handleCardClick(p)}
                                                        />
                                                    </div>
                                                ))}
                                            </HorizontalCarousel>
                                        </div>
                                    )}
                                </section>
                            )}


                            {/* EXPLORA MÁS */}
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title"> {t('explorar')}</h2>
                                <RenderError error={errors.more} />
                                <div className="publicaciones-list__grid">
                                    {visibleGridData.map(p => (
                                        <PostCard
                                            key={p.id_publicacion}
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
                                    ))}
                                </div>
                              {renderPagination("Paginación de publicaciones")}
                            </section>
                        </div>
                    )}
            </div>

            {/* Renderizacion del modal de detalles*/}
            {selectedPublicacion && (
                <DetallePublicacion
                    isOpen={true}
                    onClose={handleClose}
                    type={selectedPublicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
                    title={selectedPublicacion.titulo}
                    price={parseFloat(selectedPublicacion.precio)}
                    description={selectedPublicacion.descripcion}
                    imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
                    images={selectedPublicacion.imagenes.map(img => img.url_imagen)}
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
                    temas={
                        selectedTutor.publicaciones?.map(
                            (p: any) => p.titulo
                        ) || []
                    }
                    tags={[
                        ...(selectedTutor.etiquetas?.map(
                            (e: any) => ({
                                id: e.etiqueta.id_etiqueta,
                                name: e.etiqueta.nombre,
                                parentId: e.etiqueta.id_etiqueta_padre
                            })
                        ) || [])
                    ]}
                    onVerCertificados={() => navigateToTutorProfile(selectedTutor.id_usuario)}
                    onVerPerfil={navigateToTutorProfile}
                />
            )}
        </main>
    );
}

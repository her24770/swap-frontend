"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
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
import type { Publicacion } from "../../../types/publicacion";
import { Tag } from "../../../types/tag";
import type {Anuncio} from "../../../types/anuncio";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import FiltrosModal, { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import "./PublicacionesList.css";
import UserResCard from "../../posts/UserResumida/UserResCard";


const VISIBLE_PAGINATION_PAGES = 5;

type TutorEntry = {
    id_usuario: number;
    nombre: string;
    url_foto_perfil: string;
    calificacion: number | null;
    temas: string[];
};

function dedupePublicaciones(publicaciones: Publicacion[]): Publicacion[] {
    const seen = new Set<number>();
    return publicaciones.filter((p) => {
        if (seen.has(p.id_publicacion)) return false;
        seen.add(p.id_publicacion);
        return true;
    });
}

//Muestra usuario swap como nombre en lo que hay endpoint especifico para los detalles de usuario
function resolveTutorDisplayName(pub: Publicacion): string {
  return pub.usuario?.nombre?.trim() || "Usuario SWAP";
}

function buildTutorEntries(publicaciones: Publicacion[]): TutorEntry[] {
    const byUserId = new Map<number, TutorEntry>();

    for (const pub of publicaciones) {
        const userId = pub.usuario?.id_usuario ?? pub.id_usuario;
        if (!userId) continue;

        const tema = pub.titulo?.trim();
        const existing = byUserId.get(userId);

        if (existing) {
            if (tema && !existing.temas.includes(tema)) {
                existing.temas.push(tema);
            }
            const apiName = pub.usuario?.nombre?.trim();
            if (apiName) {
                existing.nombre = apiName;
            }
            if (pub.usuario?.url_foto_perfil?.trim()) {
                existing.url_foto_perfil = pub.usuario.url_foto_perfil.trim();
            }
            if (pub.usuario?.calificacion != null) {
                existing.calificacion = pub.usuario.calificacion;
            }
            continue;
        }

        byUserId.set(userId, {
            id_usuario: userId,
            nombre: resolveTutorDisplayName(pub),
            url_foto_perfil: pub.usuario?.url_foto_perfil?.trim() ?? "",
            calificacion: pub.usuario?.calificacion ?? null,
            temas: tema ? [tema] : [],
        });
    }

    return Array.from(byUserId.values());
}

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
    const [searchQuery, setSearchQuery] = useState("");
    const [internalPage, setInternalPage] = useState(1);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState<TutorEntry | null>(null);
    const filterAnchorRef = useRef<HTMLDivElement>(null);
    const { etiquetas, loading: etiquetasLoading } = useTodasEtiquetas();

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

    const mainSectionData = showingSearchResults ? searchResults : morePublicaciones;
    const usesServerPagination = !showingSearchResults && totalPublicaciones !== undefined;
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

    const tutoriaSourcePublicaciones = useMemo(() => {
        if (tipo !== "tutoria") return [];
        return dedupePublicaciones([
            ...tutoriaPublicaciones,
            ...recentsPublicaciones,
            ...popularPublicaciones,
            ...morePublicaciones,
        ]);
    }, [
        tipo,
        tutoriaPublicaciones,
        recentsPublicaciones,
        popularPublicaciones,
        morePublicaciones,
    ]);

    const tutorEntries = useMemo(
        () => buildTutorEntries(tutoriaSourcePublicaciones),
        [tutoriaSourcePublicaciones],
    );

    const tutorTags = useMemo(
        () => (tagsForAll ? tagsForAll(tTags) : []),
        [tagsForAll, tTags],
    );

    const tutorsSectionLoading =
        Boolean(loading.tutores) && tutoriaSourcePublicaciones.length === 0;

    const showTutorsSection = tipo === "tutoria" && tutoriaSourcePublicaciones.length > 0;

    const navigateToTutorProfile = (userId: number) => {
        setSelectedTutor(null);
        router.push(`/perfil/${userId}?modo=tutor`);
    };

    const RenderError = ({ error }: { error: any }) => (
        error ? <p className="publicaciones-list__error-inline">{t("error_loading_section")}</p> : null
    );

    const handleAplicarFiltros = (values: FiltroValues) => {
        console.log("Aplicar filtros para:", tipo, values);
        setIsFilterOpen(false);
    };

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

    return (
        <main className="publicaciones-list">
            <div className="publicaciones-list__header">
                <h1 className="publicaciones-list__title">{title}</h1>
                <div className="publicaciones-list__search-actions" ref={filterAnchorRef}>
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        filter={
                            tipo
                                ? {
                                      isOpen: isFilterOpen,
                                      onToggle: () => setIsFilterOpen((prev) => !prev),
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
                                    onLimpiar={() => console.log("Limpiar")}
                                    onClose={() => setIsFilterOpen(false)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="publicaciones-list__content">
                    {/* Estado de carga global */}
                    {(loading.global && !showingSearchResults) && morePublicaciones.length === 0 && (
                        <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
                    )}
                    {showingSearchResults && searchLoading && (
                        <div className="publicaciones-list__state"><p>{t("loading")}</p></div>
                    )}
                    
                    {showingSearchResults && !searchLoading && searchResults.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("noResultsFor", { query: searchQuery })}</p>
                        </div>
                    )}

                    {!showingSearchResults && !loading.global && morePublicaciones.length === 0 && (
                        <div className="publicaciones-list__empty">
                            <p>{tEmpty("description")}</p>
                        </div>
                    )}

                    {!showingSearchResults ? (
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
                                    ) : tutorEntries.length === 0 ? (
                                        <p>{t("noTutores")}</p>
                                    ) : (
                                        <div className="publicaciones-list__carousel-wrap publicaciones-list__carousel-wrap--tutors">
                                            <HorizontalCarousel showPagination={false}>
                                                {tutorEntries.map((tutor) => (
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
                    ) : (
                        /* RESULTADOS DE BÚSQUEDA */
                        <section className="publicaciones-list__search-results">
                            <h2 className="publicaciones-list__section-title">Resultados ({searchResults.length})</h2>
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
                            {renderPagination("Paginación de resultados")}
                        </section>
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
                    temas={selectedTutor.temas}
                    tags={tutorTags}
                    onVerCertificados={() => navigateToTutorProfile(selectedTutor.id_usuario)}
                    onVerPerfil={navigateToTutorProfile}
                />
            )}
        </main>
    );
}

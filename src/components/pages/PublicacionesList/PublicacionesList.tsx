"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import PostCard from "../../../components/posts/PostCard/PostCard";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import { useInfiniteVisibleItems } from "../../../hooks/useInfiniteVisibleItems";
import { useDetallePublicacion } from "../../../hooks/useDetallePublicacion";
import { useBusquedaSemantica } from "../../../hooks/fetch/useBusquedaSemantica";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import type { Publicacion } from "../../../types/publicacion";
import { Tag } from "../../../types/tag";
import type {Anuncio} from "../../../types/anuncio";
import AnunciosCarousel from "../../ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../perfiles/Vendedor/AdBanner/AdBanner";
import FiltrosModal, { FiltroValues, TipoFiltro } from "../../ui/Modal/FiltrosModal/FiltrosModal";
import { useTodasEtiquetas } from "../../../hooks/useTodasEtiquetas";
import "./PublicacionesList.css";


type Props = {
    title: string;
    tipo?: TipoFiltro;
    recommendedPublicaciones?: Publicacion[];
    recentsPublicaciones?: Publicacion[];
    morePublicaciones?: Publicacion[];
    loading: { recents?: boolean; recommended?: boolean; more?: boolean; global?: boolean; ads?: boolean };
    errors: { recents?: any; recommended?: any; more?: any; ads?: any };
    itemsPerPage?: number;
    tagsForAll?: (tTags: any) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    Ads: Anuncio[];
};

export default function PublicacionesList({
    title,
    tipo,
    recentsPublicaciones = [],
    recommendedPublicaciones = [],
    morePublicaciones = [],
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

    const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    const {
        visibleItems: visibleGridData,
        hasMore,
        sentinelRef,
    } = useInfiniteVisibleItems(mainSectionData, itemsPerPage);

    const mapTags = (p: Publicacion) =>
        tagsForAll
            ? tagsForAll(tTags)
            : mapPublicacionEtiquetasToTags(p.etiquetas, { name: tTags("negocio") });

    const RenderError = ({ error }: { error: any }) => (
        error ? <p className="publicaciones-list__error-inline">{t("error_loading_section")}</p> : null
    );

    const handleAplicarFiltros = (values: FiltroValues) => {
        console.log("Aplicar filtros para:", tipo, values);
        setIsFilterOpen(false);
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
                            {/* SECCIÓN RECIENTES */}
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t('reciente')}</h2>
                                <RenderError error={errors.recents} />
                                {loading.recents ? <p>Cargando recientes...</p> : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel>
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
                            {/* SECCIÓN RECOMENDADOS */}
                            <section className="publicaciones-list__section">
                                <h2 className="publicaciones-list__section-title">{t('recomendado')}</h2>
                                <RenderError error={errors.recommended} />
                                {loading.recommended ? <p>Buscando sugerencias...</p> : (
                                    <div className="publicaciones-list__carousel-wrap">
                                        <HorizontalCarousel>
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
                                                    />
                                                </div>
                                            ))}
                                        </HorizontalCarousel>
                                    </div>
                                )}
                            </section>

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
                                        />
                                    ))}
                                </div>
                                {hasMore && (
                                    <div ref={sentinelRef} className="publicaciones-list__infinite-sentinel" aria-label="Cargando más publicaciones" />
                                )}
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
                                    />
                                ))}
                            </div>
                            {hasMore && (
                                <div ref={sentinelRef} className="publicaciones-list__infinite-sentinel" aria-label="Cargando más publicaciones" />
                            )}
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
        </main>
    );
}
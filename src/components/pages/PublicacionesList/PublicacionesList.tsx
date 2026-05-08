"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../../components/posts/PostCard/PostCard";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import type { Publicacion } from "../../../types/publicacion";
import {Tag} from "../../../types/tag";
import "./PublicacionesList.css";


type Props = {
    title: string;
    publicaciones: Publicacion[];
    loading: boolean;
    error: string | null;
    itemsPerPage?: number;
    tEmpty: any;
    tTags: any;
    tagsForAll?: (tTags: any) => Tag[];
    onDetallesClick?: (p: Publicacion) => void;
    currentPage?: number;
    onPageChange?: (page: number) => void;
};

export default function PublicacionesList({
    title,
    publicaciones,
    loading,
    error,
    itemsPerPage = 12,
    tEmpty,
    tTags,
    tagsForAll,
    onDetallesClick,
    currentPage: controlledPage,
    onPageChange,
}: Props) {
    const t = useTranslations();
    const [searchQuery, setSearchQuery] = useState("");
    const [internalPage, setInternalPage] = useState(1);

    const currentPage = controlledPage ?? internalPage;
    const setCurrentPage = (p: number) => {
        if (onPageChange) onPageChange(p);
        else setInternalPage(p);
    };

    const filtered = useMemo(() => {
        return publicaciones.filter((p) =>
        (p.titulo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.descripcion || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [publicaciones, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const mapTags = (p: Publicacion) => {
        if (tagsForAll) return tagsForAll(tTags);
        return [{ id: 0, name: tTags ? tTags("negocio") : "", colorKey: "diseno" }];
    };

    return (
        <main className="publicaciones-list">
        <div className="publicaciones-list__header">
            <h1 className="publicaciones-list__title">{title}</h1>
            <SearchBar value={searchQuery} onChange={handleSearch} />
        </div>

        {loading && (
            <div className="publicaciones-list__state">
            <p className="publicaciones-list__state-text">{t("loading")}</p>
            </div>
        )}

        {error && (
            <div className="publicaciones-list__state">
            <p className="publicaciones-list__state-text publicaciones-list__state-text--error">{error}</p>
            </div>
        )}

        {!loading && !error && filtered.length === 0 && (
            <div className="publicaciones-list__empty">
            <div className="publicaciones-list__empty-icon" />
            <h2 className="publicaciones-list__empty-title">{title}</h2>
            <p className="publicaciones-list__empty-description">
                {searchQuery ? tEmpty("noResultsFor", { query: searchQuery }) : tEmpty("description")}
            </p>
            </div>
        )}

        {!loading && !error && paginated.length > 0 && (
            <>
            <div className="publicaciones-list__grid">
                {paginated.map((publicacion) => (
                <PostCard
                    key={publicacion.id_publicacion}
                    tags={mapTags(publicacion)}
                    title={publicacion.titulo}
                    price={parseFloat(publicacion.precio)}
                    description={publicacion.descripcion}
                    images={publicacion.imagenes.map((img) => img.url_imagen)}
                    estado={publicacion.estado}
                    canEdit={false}
                    onDetallesClick={() => onDetallesClick && onDetallesClick(publicacion)}
                />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="publicaciones-list__pagination">
                <button
                    className="publicaciones-list__pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                    key={page}
                    className={`publicaciones-list__pagination-btn ${page === currentPage ? "publicaciones-list__pagination-btn--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                    >
                    {page}
                    </button>
                ))}
                <button
                    className="publicaciones-list__pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    ›
                </button>
                </div>
            )}
            </>
        )}
        </main>
    );
}

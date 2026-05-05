"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import PostCard from "../../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import { useToast } from "../../hooks/useToast";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import "./descubre.css";

const ITEMS_PER_PAGE = 12;

function RegisteredToast() {
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("¡Registro exitoso! Bienvenido a SWAP.");
    }
  }, []);

  return null;
}

export default function HomePage() {
  const t = useTranslations('home');
  const tEmpty = useTranslations('common.empty');
  const tTags = useTranslations('common.tags');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = usePublicaciones({
    tipo: "negocio",
    limit: ITEMS_PER_PAGE,
    page: currentPage,
  });

  const filtered = data.filter((p) =>
    p.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); 
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <main className="descubre-page">
      <Suspense fallback={null}>
        <RegisteredToast />
      </Suspense>
      <div className="descubre-page__header">
        <h1 className="descubre-page__title">{t('title')}</h1>
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      {loading && (
        <div className="descubre-page__state">
          <p className="descubre-page__state-text">{t('loading')}</p>
        </div>
      )}

      {error && (
        <div className="descubre-page__state">
          <p className="descubre-page__state-text descubre-page__state-text--error">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="descubre-page__empty">
          <div className="descubre-page__empty-icon"></div>
          <h2 className="descubre-page__empty-title">{t('empty.title')}</h2>
          <p className="descubre-page__empty-description">
            {searchQuery
              ? tEmpty('noResultsFor', { query: searchQuery })
              : t('empty.description')}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="descubre-page__grid">
            {filtered.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                tags={[{ id: 1, name: tTags('negocio'), colorKey: "diseno" }]}
                title={publicacion.titulo}
                price={parseFloat(publicacion.precio)}
                description={publicacion.descripcion}
                images={publicacion.imagenes.map((img) => img.url_imagen)}
                estado={publicacion.estado}
                canEdit={false}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="descubre-page__pagination">
              <button
                className="descubre-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`descubre-page__pagination-btn ${
                    page === currentPage ? "descubre-page__pagination-btn--active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="descubre-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
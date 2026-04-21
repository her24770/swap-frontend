"use client";

import { useState } from "react";
import PostCard from "../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../hooks/fetch/usePublicaciones";
import imagePath from "../../public/images/uvg.jpg";
import SearchBar from "../components/ui/SearchBar/SearchBar";
import "./descubre.css";

const ITEMS_PER_PAGE = 12;

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = usePublicaciones({
    tipo: "negocio",
    limit: ITEMS_PER_PAGE,
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
      <div className="descubre-page__header">
        <h1 className="descubre-page__title">DESCUBRE</h1>
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      {loading && (
        <div className="descubre-page__state">
          <p className="descubre-page__state-text">Cargando negocios...</p>
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
          <div className="descubre-page__empty-icon">🏪</div>
          <h2 className="descubre-page__empty-title">No hay negocios disponibles</h2>
          <p className="descubre-page__empty-description">
            {searchQuery
              ? `No se encontraron resultados para "${searchQuery}"`
              : "Aún no hay negocios estudiantiles publicados."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="descubre-page__grid">
            {filtered.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                tags={[{ id: 1, name: "Negocio", type: "categoria" }]}
                title={publicacion.titulo}
                price={parseFloat(publicacion.precio)}
                description={publicacion.descripcion}
                images={[imagePath.src]}
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
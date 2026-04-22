"use client";

import { useState } from "react";
import PostCard from "../../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import imagePath from "../../../public/images/uvg.jpg";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import "./tutorias.css";

const ITEMS_PER_PAGE = 12;

export default function TutoriasPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = usePublicaciones({
    tipo: "tutoria",
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
    <main className="tutorias-page">
      <div className="tutorias-page__header">
        <h1 className="tutorias-page__title">TUTORÍAS</h1>
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      {loading && (
        <div className="tutorias-page__state">
          <p className="tutorias-page__state-text">Cargando tutorías...</p>
        </div>
      )}

      {error && (
        <div className="tutorias-page__state">
          <p className="tutorias-page__state-text tutorias-page__state-text--error">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="tutorias-page__empty">
          <div className="tutorias-page__empty-icon"></div>
          <h2 className="tutorias-page__empty-title">No hay tutorías disponibles</h2>
          <p className="tutorias-page__empty-description">
            {searchQuery
              ? `No se encontraron resultados para "${searchQuery}"`
              : "Aún no hay tutorías estudiantiles publicadas."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="tutorias-page__grid">
            {filtered.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                tags={[{ id: 1, name: "Tutoría",  colorKey: "diseno" }]}
                title={publicacion.titulo}
                price={parseFloat(publicacion.precio)}
                description={publicacion.descripcion}
                images={[imagePath.src]}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="tutorias-page__pagination">
              <button
                className="tutorias-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`tutorias-page__pagination-btn ${
                    page === currentPage ? "tutorias-page__pagination-btn--active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="tutorias-page__pagination-btn"
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
"use client";
import PostCard from "../../components/posts/PostCard/PostCard";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import { useState, useEffect } from "react";
import { apiClient, type ApiError } from "../../lib/apiClient";
import { TAG_NEGOCIO} from "../../lib/tags";
import "./NegociosPage.css";

import type { Publicacion, PublicacionesResponse } from "../../types/publicacion";

const ITEMS_PER_PAGE = 12;

export default function NegociosPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNegocios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<PublicacionesResponse>("/api/publicacion/?tipo=negocio");
      setPublicaciones(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error(apiError.message);
      setError(apiError.message || "No fue posible obtener los negocios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegocios();
  }, []);

  const filtered = publicaciones.filter((p) =>
    p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <main className="negocios-page">
      <div className="negocios-page__header">
        <h1 className="negocios-page__title">NEGOCIOS</h1>
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      {loading && (
        <div className="negocios-page__state">
          <p className="negocios-page__state-text">Cargando negocios...</p>
        </div>
      )}

      {error && (
        <div className="negocios-page__state">
          <p className="negocios-page__state-text negocios-page__state-text--error">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="negocios-page__empty">
          <div className="negocios-page__empty-icon">🏪</div>
          <h2 className="negocios-page__empty-title">No hay negocios disponibles</h2>
          <p className="negocios-page__empty-description">
            {searchQuery
              ? `No se encontraron resultados para "${searchQuery}"`
              : "Aún no hay negocios estudiantiles publicados. ¡Sé el primero en publicar el tuyo!"}
          </p>
        </div>
      )}

      {!loading && !error && paginated.length > 0 && (
        <>
          <div className="negocios-page__grid">
            {paginated.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                tags={[TAG_NEGOCIO]}
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
            <div className="negocios-page__pagination">
              <button
                className="negocios-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`negocios-page__pagination-btn ${
                    page === currentPage ? "negocios-page__pagination-btn--active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="negocios-page__pagination-btn"
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
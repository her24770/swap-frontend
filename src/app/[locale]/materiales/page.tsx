"use client";
import { useTranslations } from 'next-intl';
import PostCard from "../../../components/posts/PostCard/PostCard";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import { useState, useEffect, use } from "react";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { TAG_MATERIAL } from "../../../lib/tags";
import "./MaterialesPage.css";
import {useDetallePublicacion} from "../../../hooks/useDetallePublicacion";
import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";

const ITEMS_PER_PAGE = 12;

export default function MaterialesPage() {
  const t = useTranslations('materiales');
  const tEmpty = useTranslations('common.empty');
  const tTags = useTranslations('common.tags');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMateriales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<PublicacionesResponse>("/api/publicacion/?tipo=material");
      setPublicaciones(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error(apiError.message);
      setError(apiError.message || t('errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
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

  const{
    selectedPublicacion,
    loadingDetalle,
    isSaved,
    setIsSaved,
    handleDetallesClick,
    handleClose,
  } = useDetallePublicacion();

  return (
    <main className="materiales-page">
      <div className="materiales-page__header">
        <h1 className="materiales-page__title">{t('title')}</h1>
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      {loading && (
        <div className="materiales-page__state">
          <p className="materiales-page__state-text">{t('loading')}</p>
        </div>
      )}

      {error && (
        <div className="materiales-page__state">
          <p className="materiales-page__state-text materiales-page__state-text--error">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="materiales-page__empty">
          <div className="materiales-page__empty-icon">📚</div>
          <h2 className="materiales-page__empty-title">{t('empty.title')}</h2>
          <p className="materiales-page__empty-description">
            {searchQuery
              ? tEmpty('noResultsFor', { query: searchQuery })
              : t('empty.description')}
          </p>
        </div>
      )}

      {!loading && !error && paginated.length > 0 && (
        <>
          <div className="materiales-page__grid">
            {paginated.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                tags={[{ ...TAG_MATERIAL, name: tTags('material') }]}
                title={publicacion.titulo}
                price={parseFloat(publicacion.precio)}
                description={publicacion.descripcion}
                images={publicacion.imagenes.map((img) => img.url_imagen)}
                estado={publicacion.estado}
                canEdit={false}
                onDetallesClick={() => handleDetallesClick(publicacion)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="materiales-page__pagination">
              <button
                className="materiales-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`materiales-page__pagination-btn ${
                    page === currentPage ? "materiales-page__pagination-btn--active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="materiales-page__pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
      {selectedPublicacion && (
        <DetallePublicacion
          isOpen={true}
          onClose={handleClose}
          type="venta"
          title={selectedPublicacion.titulo}
          price={parseFloat(selectedPublicacion.precio)}
          description={selectedPublicacion.descripcion}
          imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
          likes={selectedPublicacion.me_gusta}
          sellerName={loadingDetalle ? "Cargando..." : (selectedPublicacion.usuario.nombre ?? "Usuario de SWAP")}
          sellerRating={selectedPublicacion.usuario.calificacion ?? 0}
          sellerImageUrl={selectedPublicacion.usuario.url_foto_perfil}
          isSaved={isSaved}
          onToggleSave={() => setIsSaved((prev) => !prev)}
          onVerCertificados={() => console.log("ver certificados")}
          onSolicitarTutoria={() => console.log("solicitar tutoría")}
        />
      )}
    </main>
  );
}
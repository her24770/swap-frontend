"use client";
import { useTranslations } from 'next-intl';
import PostCard from "../../../components/posts/PostCard/PostCard";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import { useState, useEffect, use } from "react";
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
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

  const handleSearch = (value: string) => {};

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
      <PublicacionesList
        title={t('title')}
        publicaciones={publicaciones}
        loading={loading}
        error={error}
        itemsPerPage={ITEMS_PER_PAGE}
        tEmpty={tEmpty}
        tTags={tTags}
        tagsForAll={() => [{ ...TAG_MATERIAL, name: tTags('material') }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
      />

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
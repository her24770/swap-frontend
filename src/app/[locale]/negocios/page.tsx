"use client";
import { useTranslations } from 'next-intl';
import PostCard from "../../../components/posts/PostCard/PostCard";
import SearchBar from "../../../components/ui/SearchBar/SearchBar";
import { useState, useEffect } from "react";
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { TAG_NEGOCIO } from "../../../lib/tags";
import "./NegociosPage.css";

import type { Publicacion, PublicacionesResponse } from "../../../types/publicacion";

const ITEMS_PER_PAGE = 12;

export default function NegociosPage() {
  const t = useTranslations('negocios');
  const tEmpty = useTranslations('common.empty');
  const tTags = useTranslations('common.tags');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  const fetchNegocios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<PublicacionesResponse>("/api/publicacion/?tipo=negocio");
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
    fetchNegocios();
  }, []);

  const handleSearch = (value: string) => {};

  const loadingStates = {
      more: moreLoading,
      recents: recentsLoading,
      recommended: recommendedLoading,
      global: moreLoading || recentsLoading || recommendedLoading
    };

    const errors = {
      more: moreError,
      recents: recentsError,
      recommended: recommendedError
    };


  return (
    <main className="negocios-page">
      <PublicacionesList
        title={t('title')}
        publicaciones={publicaciones}
        loading={loading}
        error={error}
        itemsPerPage={ITEMS_PER_PAGE}
        tEmpty={tEmpty}
        tTags={tTags}
        tagsForAll={() => [{ ...TAG_NEGOCIO, name: tTags('negocio') }]}
      />
    </main>
  );
}
"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import PostCard from "../../../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { TAG_TUTORIA } from "../../../lib/tags";
import "./tutorias.css";

const ITEMS_PER_PAGE = 12;

export default function TutoriasPage() {
  const t = useTranslations('tutorias');
  const tEmpty = useTranslations('common.empty');
  const tTags = useTranslations('common.tags');

  const { data, loading, error } = usePublicaciones({ tipo: "tutoria", limit: ITEMS_PER_PAGE });

  return (
    <main className="tutorias-page">
      <PublicacionesList
        title={t('title')}
        publicaciones={data}
        loading={loading}
        error={error}
        itemsPerPage={ITEMS_PER_PAGE}
        tEmpty={tEmpty}
        tTags={tTags}
        tagsForAll={() => [{ ...TAG_TUTORIA, name: tTags('tutoria') }]}
      />
    </main>
  );
}
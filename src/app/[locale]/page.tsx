"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import PostCard from "../../components/posts/PostCard/PostCard";
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../components/pages/PublicacionesList/PublicacionesList";
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
  const tTags = useTranslations('common.tags');

  const [currentPage, setCurrentPage] = useState(1);
  const { data: moreData, loading: moreLoading, error: moreError } = usePublicaciones({ limit: ITEMS_PER_PAGE });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "me_gusta" });

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
    <main className="descubre-page">
      <Suspense fallback={null}>
        <RegisteredToast />
      </Suspense>
      <PublicacionesList
        title={t('title')}
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        morePublicaciones={moreData || []}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ id: 1, name: tTags('negocio'), colorKey: "diseno" }]}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </main>
  );
}
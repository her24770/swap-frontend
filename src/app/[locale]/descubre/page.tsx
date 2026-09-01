"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import { useDetallePublicacion } from "../../../hooks/useDetallePublicacion";
import "../seccion.css";

const ITEMS_PER_PAGE = 12;

export default function DescubrePage() {
  const t = useTranslations('descubre');
  const [morePage, setMorePage] = useState(1);

  const { data: moreData, total: moreTotal, loading: moreLoading, error: moreError } = usePublicaciones({ all: true, limit: ITEMS_PER_PAGE, page: morePage });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({ personalized: true });

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

  const { handleDetallesClick } = useDetallePublicacion();

  return (
    <main className="seccion-page">
      <PublicacionesList
        title={t('title')}
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        morePublicaciones={moreData || []}
        totalPublicaciones={moreTotal}
        currentPage={morePage}
        onPageChange={setMorePage}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        onDetallesClick={(p) => handleDetallesClick(p)}
        Ads={[]}
      />
    </main>
  );
}

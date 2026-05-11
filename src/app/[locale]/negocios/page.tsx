"use client";
import { useTranslations } from 'next-intl';
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import { TAG_NEGOCIO } from "../../../lib/tags";
import "./NegociosPage.css";

const ITEMS_PER_PAGE = 12;

export default function NegociosPage() {
  const t = useTranslations('negocios');
  const tTags = useTranslations('common.tags');

  const { data: moreData, loading: moreLoading, error: moreError } = usePublicaciones({ tipo: "negocio", limit: ITEMS_PER_PAGE });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ tipo: "negocio", limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({ tipo: "negocio", limit: ITEMS_PER_PAGE, sort: "me_gusta"  });

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
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        morePublicaciones={moreData || []}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ ...TAG_NEGOCIO, name: tTags('negocio') }]}
      />
    </main>
  );
}
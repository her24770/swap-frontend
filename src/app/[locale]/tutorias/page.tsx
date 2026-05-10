"use client";

import { useTranslations } from 'next-intl';
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { TAG_TUTORIA } from "../../../lib/tags";
import "./tutorias.css";

const ITEMS_PER_PAGE = 12;

export default function TutoriasPage() {
  const t = useTranslations('tutorias');
  const tEmpty = useTranslations('common.empty');
  const tTags = useTranslations('common.tags');

  const { data: moreData, loading: moreLoading, error: moreError } = 
    usePublicaciones({ tipo: "tutoria", limit: ITEMS_PER_PAGE });
  
  const { data: recentsData, loading: recentsLoading, error: recentsError } = 
    usePublicaciones({ tipo: "tutoria", limit: ITEMS_PER_PAGE, sort: "fecha" });
  
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = 
    usePublicaciones({ tipo: "tutoria", limit: ITEMS_PER_PAGE, sort: "me_gusta" }); 

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
    <main className="tutorias-page">
      <PublicacionesList
        title={t('title')}
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        morePublicaciones={moreData || []}
        loading={loadingStates} 
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tEmpty={tEmpty}
        tTags={tTags}
        tagsForAll={() => [{ ...TAG_TUTORIA, name: tTags('tutoria') }]}
      />
    </main>
  );
}
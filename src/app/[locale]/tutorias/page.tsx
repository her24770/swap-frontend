"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { TAG_TUTORIA } from "../../../lib/tags";
import "../seccion.css";
import {useDetallePublicacion} from "../../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";

const ITEMS_PER_PAGE = 12;
const PUBLICACIONES_FETCH_LIMIT = 100;

export default function TutoriasPage() {
  const t = useTranslations('tutorias');
  const tTags = useTranslations('common.tags');
  const router = useRouter();

  const { data: moreData, loading: moreLoading, error: moreError } = 
    usePublicaciones({ tipo: "tutoria", all: true, limit: PUBLICACIONES_FETCH_LIMIT });
  
  const { data: recentsData, loading: recentsLoading, error: recentsError } = 
    usePublicaciones({ tipo: "tutoria", limit: ITEMS_PER_PAGE, sort: "fecha" });
  
  const { data: popularData, loading: popularLoading, error: popularError } = 
    usePublicaciones({ tipo: "tutoria", recommended: true}); 

  const loadingStates = {
    more: moreLoading,
    recents: recentsLoading,
    popular: popularLoading,
    global: moreLoading || recentsLoading || popularLoading
  };

  const errors = {
    more: moreError,
    recents: recentsError,
    popular: popularError
  };

  const{
      selectedPublicacion,
      loadingDetalle,
      handleDetallesClick,
      handleClose,
    } = useDetallePublicacion();

  return (
    <main className="seccion-page">
      <PublicacionesList
        title={t('title')}
        tipo="tutoria"
        recentsPublicaciones={recentsData || []}
        popularPublicaciones={popularData || []}
        morePublicaciones={moreData || []}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ ...TAG_TUTORIA, name: tTags('tutoria') }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
        Ads={[]}
      />
    </main>
  );
}

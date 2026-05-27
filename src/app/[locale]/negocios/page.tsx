"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import { TAG_NEGOCIO } from "../../../lib/tags";
import "../seccion.css";
import {useDetallePublicacion} from "../../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import { useAnuncios } from "../../../hooks/fetch/useAnuncios";

const ITEMS_PER_PAGE = 12;

export default function NegociosPage() {
  const t = useTranslations('negocios');
  const tTags = useTranslations('common.tags');
  const router = useRouter();
  const [morePage, setMorePage] = useState(1);

  const { data: moreData, total: moreTotal, loading: moreLoading, error: moreError } = usePublicaciones({ tipo: "negocio", all: true, limit: ITEMS_PER_PAGE, page: morePage });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ tipo: "negocio", limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: popularData, loading: popularLoading, error: popularError } = usePublicaciones({ tipo: "negocio", recommended: true});
  const { data: adsData, loading: adsLoading, error: adsError } = useAnuncios();

  const loadingStates = {
    more: moreLoading,
    recents: recentsLoading,
    popular: popularLoading,
    ads: adsLoading,
    global: moreLoading || recentsLoading || popularLoading
  };

  const errors = {
    more: moreError,
    recents: recentsError,
    popular: popularError,
    ads: adsError
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
        tipo="negocio"
        recentsPublicaciones={recentsData || []}
        popularPublicaciones={popularData || []}
        morePublicaciones={moreData || []}
        totalPublicaciones={moreTotal}
        currentPage={morePage}
        onPageChange={setMorePage}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ ...TAG_NEGOCIO, name: tTags('negocio') }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
        Ads={adsData || []}
      />
    </main>
  );
}

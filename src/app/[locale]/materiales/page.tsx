"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import { TAG_MATERIAL } from "../../../lib/tags";
import "../seccion.css";
import {useDetallePublicacion} from "../../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import { useAnuncios } from "../../../hooks/fetch/useAnuncios";

const ITEMS_PER_PAGE = 12;

export default function MaterialesPage() {
  const t = useTranslations('materiales');
  const tTags = useTranslations('common.tags');
  const router = useRouter();
  const [morePage, setMorePage] = useState(1);

  const { data: moreData, total: moreTotal, loading: moreLoading, error: moreError } = usePublicaciones({ tipo: "material", all: true, limit: ITEMS_PER_PAGE, page: morePage });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ tipo: "material", limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: popularData, loading: popularLoading, error: popularError } = usePublicaciones({ tipo: "material", recommended: true});

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
        tipo="material"
        recentsPublicaciones={recentsData || []}
        popularPublicaciones={popularData || []}
        morePublicaciones={moreData || []}
        totalPublicaciones={moreTotal}
        currentPage={morePage}
        onPageChange={setMorePage}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ ...TAG_MATERIAL, name: tTags('material') }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
        Ads={[]}
      />
    </main>
  );
}

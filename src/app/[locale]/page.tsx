"use client";

import { useEffect, useRef, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../components/pages/PublicacionesList/PublicacionesList";
import { useToast } from "../../hooks/useToast";
import {useDetallePublicacion} from "../../hooks/useDetallePublicacion";
import { useAnuncios } from "../../hooks/fetch/useAnuncios";

import "./seccion.css";

const ITEMS_PER_PAGE = 12;

function RegisteredToast() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const yaMostrado = useRef(false);

  // El toast se muestra una sola vez aunque `toast` cambie de identidad en cada render.
  useEffect(() => {
    if (yaMostrado.current) return;
    if (searchParams.get("registered") === "true") {
      yaMostrado.current = true;
      toast.success("¡Registro exitoso! Bienvenido a SWAP.");
    }
  }, [searchParams, toast]);

  return null;
}

export default function HomePage() {
  const t = useTranslations('home');
  const tTags = useTranslations('common.tags');
  const [morePage, setMorePage] = useState(1);

  const { data: moreData, total: moreTotal, loading: moreLoading, error: moreError } = usePublicaciones({ all: true, limit: ITEMS_PER_PAGE, page: morePage });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({personalized: true});
  const { data: popularData, loading: popularLoading, error: popularError } = usePublicaciones({ recommended: true });
  const { data: adsData, loading: adsLoading, error: adsError } = useAnuncios();

  const loadingStates = {
    more: moreLoading,
    recents: recentsLoading,
    recommended: recommendedLoading,
    popular: popularLoading,
    ads: adsLoading,
    global: moreLoading || recentsLoading || recommendedLoading || popularLoading || adsLoading
  };

  const errors = {
    more: moreError,
    recents: recentsError,
    recommended: recommendedError,
    popular: popularError,
    ads: adsError
  };

  const{
    handleDetallesClick,
  } = useDetallePublicacion();

  return (
    <main className="seccion-page">
      <Suspense fallback={null}>
        <RegisteredToast />
      </Suspense>
      
      <PublicacionesList
        title={t('title')}
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        popularPublicaciones={popularData || []}
        morePublicaciones={moreData || []}
        totalPublicaciones={moreTotal}
        currentPage={morePage}
        onPageChange={setMorePage}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ id: 1, name: tTags('negocio'), parentId: null }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
        Ads={adsData || []}
      />
    </main>
  );
}

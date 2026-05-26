"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../components/pages/PublicacionesList/PublicacionesList";
import { useToast } from "../../hooks/useToast";
import {useDetallePublicacion} from "../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import AnunciosCarousel from "../../components/ui/AnunciosCarousel/AnunciosCarousel";
import AdBanner from "../../components/perfiles/Vendedor/AdBanner/AdBanner";
import imagePath from "../../../public/images/uvg.jpg";
import { useAnuncios } from "../../hooks/fetch/useAnuncios";

import "./seccion.css";

const ITEMS_PER_PAGE = 12;
const PUBLICACIONES_FETCH_LIMIT = 100;

const MOCK_ADs = [ 
  {
    imageUrl: imagePath.src,
    title: "¡Vende tus productos fácilmente!",
    description: "Publica tus productos en SWAP y llega a miles de compradores potenciales.",
  },
  {
    imageUrl: imagePath.src,
    title: "¿Buscas algo específico?",
    description: "Encuentra lo que necesitas en una sola plataforma.",
  },
  {
    imageUrl: imagePath.src,
    title: "¡Únete a la comunidad de SWAP!",
    description: "Conecta con otros vendedores y compradores en nuestra comunidad.",
  },
];
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
  const router = useRouter();

  const { data: moreData, loading: moreLoading, error: moreError } = usePublicaciones({ all: true, limit: PUBLICACIONES_FETCH_LIMIT });
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
    selectedPublicacion,
    loadingDetalle,
    handleDetallesClick,
    handleClose,
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

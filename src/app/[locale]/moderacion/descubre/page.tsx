"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePublicaciones } from "../../../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../../../components/pages/PublicacionesList/PublicacionesList";
import { useAnuncios } from "../../../../hooks/fetch/useAnuncios";
import "../../seccion.css";

const ITEMS_PER_PAGE = 12;

// Version de solo lectura de app/[locale]/page.tsx para el panel de moderador.
// A diferencia de esa pagina, NO llama a usePublicaciones({personalized:true})
// (GET /api/recomendaciones/personalizadas) porque ese endpoint solo verifica
// autenticar() y resuelve las recomendaciones contra el `sub` del token como si
// fuera siempre un id_usuario -- un moderador terminaria recibiendo (o afectando)
// datos de un Usuario cuyo id_usuario coincida numericamente con su id_moderador.
export default function ModeracionDescubrePage() {
  const t = useTranslations("home");
  const tTags = useTranslations("common.tags");
  const [morePage, setMorePage] = useState(1);

  const { data: moreData, total: moreTotal, loading: moreLoading, error: moreError } = usePublicaciones({ all: true, limit: ITEMS_PER_PAGE, page: morePage });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: popularData, loading: popularLoading, error: popularError } = usePublicaciones({ recommended: true });
  const { data: adsData, loading: adsLoading, error: adsError } = useAnuncios();

  const loadingStates = {
    more: moreLoading,
    recents: recentsLoading,
    popular: popularLoading,
    ads: adsLoading,
    global: moreLoading || recentsLoading || popularLoading || adsLoading,
  };

  const errors = {
    more: moreError,
    recents: recentsError,
    popular: popularError,
    ads: adsError,
  };

  return (
    <main className="seccion-page">
      <PublicacionesList
        title={t("title")}
        recentsPublicaciones={recentsData || []}
        popularPublicaciones={popularData || []}
        morePublicaciones={moreData || []}
        totalPublicaciones={moreTotal}
        currentPage={morePage}
        onPageChange={setMorePage}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ id: 1, name: tTags("negocio"), parentId: null }]}
        Ads={adsData || []}
        soloLectura
        perfilBasePath="/moderacion/perfil"
      />
    </main>
  );
}

"use client";
import { useTranslations } from 'next-intl';
import PublicacionesList from "../../../components/pages/PublicacionesList/PublicacionesList";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import { TAG_MATERIAL } from "../../../lib/tags";
import "./MaterialesPage.css";
import {useDetallePublicacion} from "../../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";

const ITEMS_PER_PAGE = 12;

export default function MaterialesPage() {
  const t = useTranslations('materiales');
  const tTags = useTranslations('common.tags');

  const { data: moreData, loading: moreLoading, error: moreError } = usePublicaciones({ tipo: "material", limit: ITEMS_PER_PAGE });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ tipo: "material", limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({ tipo: "material", limit: ITEMS_PER_PAGE, sort: "me_gusta" });

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

  const{
    selectedPublicacion,
    loadingDetalle,
    isSaved,
    setIsSaved,
    handleDetallesClick,
    handleClose,
  } = useDetallePublicacion();

  return (
    <main className="materiales-page">
      <PublicacionesList
        title={t('title')}
        recentsPublicaciones={recentsData || []}
        recommendedPublicaciones={recommendedData || []}
        morePublicaciones={moreData || []}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ ...TAG_MATERIAL, name: tTags('material') }]}
        onDetallesClick={(p) => handleDetallesClick(p)}
      />

      {selectedPublicacion && (
        <DetallePublicacion
          isOpen={true}
          onClose={handleClose}
          type="venta"
          title={selectedPublicacion.titulo}
          price={parseFloat(selectedPublicacion.precio)}
          description={selectedPublicacion.descripcion}
          imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
          likes={selectedPublicacion.me_gusta}
          sellerName={loadingDetalle ? "Cargando..." : (selectedPublicacion.usuario.nombre ?? "Usuario de SWAP")}
          sellerRating={selectedPublicacion.usuario.calificacion ?? 0}
          sellerImageUrl={selectedPublicacion.usuario.url_foto_perfil}
          isSaved={isSaved}
          onToggleSave={() => setIsSaved((prev) => !prev)}
          onVerCertificados={() => console.log("ver certificados")}
          onSolicitarTutoria={() => console.log("solicitar tutoría")}
        />
      )}
    </main>
  );
}
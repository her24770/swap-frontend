"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { usePublicaciones } from "../../hooks/fetch/usePublicaciones";
import PublicacionesList from "../../components/pages/PublicacionesList/PublicacionesList";
import { useToast } from "../../hooks/useToast";
import {useDetallePublicacion} from "../../hooks/useDetallePublicacion";
import DetallePublicacion from "../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import "./seccion.css";

const ITEMS_PER_PAGE = 10;

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

  const { data: moreData, loading: moreLoading, error: moreError } = usePublicaciones({ limit: ITEMS_PER_PAGE });
  const { data: recentsData, loading: recentsLoading, error: recentsError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "fecha" });
  const { data: recommendedData, loading: recommendedLoading, error: recommendedError } = usePublicaciones({ limit: ITEMS_PER_PAGE, sort: "me_gusta" });

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
        morePublicaciones={moreData || []}
        loading={loadingStates}
        errors={errors}
        itemsPerPage={ITEMS_PER_PAGE}
        tagsForAll={() => [{ id: 1, name: tTags('negocio'), colorKey: "diseno" }]}
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
        publicacionId={selectedPublicacion.id_publicacion}
        sellerName={loadingDetalle ? "Cargando..." : (selectedPublicacion.usuario.nombre ?? "Usuario de SWAP")}
        sellerRating={selectedPublicacion.usuario.calificacion ?? 0}
        sellerId={selectedPublicacion.usuario.id_usuario}
        sellerImageUrl={selectedPublicacion.usuario.url_foto_perfil}
        onSellerClick={(sellerId) => {
          handleClose();
          router.push(`/perfil/${sellerId}?modo=vendedor`);
        }}
        onVerCertificados={() => console.log("ver certificados")}
        onSolicitarTutoria={() => console.log("solicitar tutoría")}
        />
      )}
    </main>
  );
}

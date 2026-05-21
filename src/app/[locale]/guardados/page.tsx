"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PostCard from "../../../components/posts/PostCard/PostCard";
import DetallePublicacion from "../../../components/ui/Modal/DetallePuclicacion/DetallePublicacion";
import { useGuardados } from "../../../hooks/useGuardados";
import { useInfiniteVisibleItems } from "../../../hooks/useInfiniteVisibleItems";
import type { Publicacion } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";
import "../seccion.css";
import "./guardados.css";

const ITEMS_PER_PAGE = 10;

export default function GuardadosPage() {
  const t = useTranslations("perfil.sections");
  const router = useRouter();
  const { guardados, loading } = useGuardados();
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const {
    visibleItems: visibleGuardados,
    hasMore,
    sentinelRef,
  } = useInfiniteVisibleItems(guardados, ITEMS_PER_PAGE);

  return (
    <main className="seccion-page guardados-page">
      <header className="guardados-page__header">
        <h1 className="guardados-page__title">{t("saved")}</h1>
      </header>

      {loading && (
        <p className="guardados-page__state">Cargando publicaciones guardadas...</p>
      )}

      {!loading && guardados.length === 0 && (
        <p className="guardados-page__state">Aún no tienes publicaciones guardadas.</p>
      )}

      {!loading && guardados.length > 0 && (
        <>
          <section className="guardados-page__grid">
            {visibleGuardados.map((publicacion) => (
              <PostCard
                key={publicacion.id_publicacion}
                publicacionId={publicacion.id_publicacion}
                modoGuardado
                tags={mapTags(publicacion)}
                title={publicacion.titulo}
                price={parseFloat(publicacion.precio)}
                description={publicacion.descripcion}
                images={publicacion.imagenes.map((img) => img.url_imagen)}
                estado={publicacion.estadoRel?.estado ?? publicacion.estado}
                onDetallesClick={() => setSelectedPublicacion(publicacion)}
              />
            ))}
          </section>
          {hasMore && (
            <div
              ref={sentinelRef}
              className="guardados-page__infinite-sentinel"
              aria-label="Cargando más publicaciones guardadas"
            />
          )}
        </>
      )}

      {selectedPublicacion && (
        <DetallePublicacion
          isOpen={true}
          onClose={() => setSelectedPublicacion(null)}
          type={selectedPublicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutoria" : "venta"}
          title={selectedPublicacion.titulo}
          price={parseFloat(selectedPublicacion.precio)}
          description={selectedPublicacion.descripcion}
          imageUrl={selectedPublicacion.imagenes[0]?.url_imagen ?? ""}
          likes={selectedPublicacion.me_gusta}
          publicacionId={selectedPublicacion.id_publicacion}
          sellerName={selectedPublicacion.usuario?.nombre ?? "Usuario de SWAP"}
          sellerRating={Number(selectedPublicacion.usuario?.calificacion ?? 0)}
          sellerId={selectedPublicacion.usuario?.id_usuario}
          sellerImageUrl={selectedPublicacion.usuario?.url_foto_perfil}
          onSellerClick={(sellerId) => {
            setSelectedPublicacion(null);
            router.push(`/perfil/${sellerId}`);
          }}
        />
      )}
    </main>
  );
}

function mapTags(publicacion: Publicacion): Tag[] {
  if (!publicacion.etiquetas?.length) {
    return [{ id: 0, name: publicacion.tipoPerfil?.tipo_perfil ?? "Publicación", colorKey: "diseno" }];
  }

  return publicacion.etiquetas.map((rel) => ({
    id: rel.etiqueta.id_etiqueta,
    name: rel.etiqueta.nombre,
    colorKey: "diseno",
  }));
}

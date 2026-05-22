"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PostCard from "../../../posts/PostCard/PostCard";
import HorizontalCarousel from "../../../ui/HorizontalCarousel/HorizontalCarousel";
import DetallePublicacion from "../../../ui/Modal/DetallePuclicacion/DetallePublicacion";
import { useGuardados } from "../../../../hooks/useGuardados";
import { useInfiniteVisibleItems } from "../../../../hooks/useInfiniteVisibleItems";
import type { Publicacion } from "../../../../types/publicacion";
import type { Tag } from "../../../../types/tag";
import "./PublicacionesGuardadas.css";

type PublicacionesGuardadasVariant = "carousel" | "grid";

interface PublicacionesGuardadasProps {
  variant?: PublicacionesGuardadasVariant;
  title?: string;
  showTitle?: boolean;
  itemsPerPage?: number;
  className?: string;
}

const DEFAULT_ITEMS_PER_PAGE = 10;

export default function PublicacionesGuardadas({
  variant = "carousel",
  title,
  showTitle = true,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  className = "",
}: PublicacionesGuardadasProps) {
  const t = useTranslations("perfil");
  const router = useRouter();
  const { guardados, loading } = useGuardados();
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const {
    visibleItems: visibleGuardados,
    hasMore,
    sentinelRef,
  } = useInfiniteVisibleItems(guardados, itemsPerPage);

  const sectionTitle = title ?? t("sections.saved");
  const sectionClassName = [
    "perfil-page__section",
    "publicaciones-guardadas",
    `publicaciones-guardadas--${variant}`,
    className,
  ].filter(Boolean).join(" ");

  const renderPostCard = (publicacion: Publicacion) => (
    <PostCard
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
  );

  return (
    <section className={sectionClassName}>
      {showTitle && (
        <h2 className="perfil-page__section-title">{sectionTitle}</h2>
      )}

      {loading && (
        <p className="perfil-page__coming-soon">Cargando publicaciones guardadas...</p>
      )}

      {!loading && guardados.length === 0 && (
        <p className="perfil-page__coming-soon">Aún no tienes publicaciones guardadas.</p>
      )}

      {!loading && guardados.length > 0 && variant === "carousel" && (
        <HorizontalCarousel>
          {guardados.map((publicacion) => (
            <div key={publicacion.id_publicacion} className="h-carousel__item">
              {renderPostCard(publicacion)}
            </div>
          ))}
        </HorizontalCarousel>
      )}

      {!loading && guardados.length > 0 && variant === "grid" && (
        <>
          <div className="publicaciones-guardadas__grid">
            {visibleGuardados.map((publicacion) => (
              <div key={publicacion.id_publicacion} className="publicaciones-guardadas__grid-item">
                {renderPostCard(publicacion)}
              </div>
            ))}
          </div>
          {hasMore && (
            <div
              ref={sentinelRef}
              className="publicaciones-guardadas__infinite-sentinel"
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
            const modo = selectedPublicacion.tipoPerfil?.tipo_perfil === "tutoria" ? "tutor" : "vendedor";
            setSelectedPublicacion(null);
            router.push(`/perfil/${sellerId}?modo=${modo}`);
          }}
          onAcordarCompra={() => console.log("acordar compra")}
          onSolicitarTutoria={() => console.log("solicitar tutoria")}
        />
      )}
    </section>
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

"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import HorizontalCarousel from "../../ui/HorizontalCarousel/HorizontalCarousel";
import PostCard from "../../posts/PostCard/PostCard";
import { usePublicacionesDestacadas } from "../../../hooks/fetch/usePublicacionesDestacadas";
import { mapPublicacionEtiquetasToTags } from "../../../lib/tags";
import { usePerspectivaInterna } from "../../../context/PerspectivaInternaContext";
import { useServices } from "../../../services/context/ServiceContext";
import { useUIStore } from "../../../store/uiStore";
import type { Publicacion } from "../../../types/publicacion";
import type { Tag } from "../../../types/tag";

interface FeaturedPost {
  id: number;
  title: string;
  price: number;
  description: string;
  tags: Tag[];
  estado: string;
  images: string[];
  categorias: number[];
}

interface FeaturedPublicationsCarouselProps {
  userId?: number;
}

const mapFeaturedPosts = (data: Publicacion[]): FeaturedPost[] =>
  data.map((pub) => ({
    id: pub.id_publicacion,
    title: pub.titulo,
    price: typeof pub.precio === "string" ? parseFloat(pub.precio) : pub.precio,
    description: pub.descripcion,
    tags: mapPublicacionEtiquetasToTags(pub.etiquetas, {
      name: pub.tipoPerfil ? pub.tipoPerfil.tipo_perfil : "destacado",
    }),
    estado: pub.estadoRel?.estado ?? "activo",
    images: pub.imagenes?.map((img) => img.url_imagen) || [],
    categorias: pub.etiquetas?.map((e) => e.id_etiqueta) || [],
  }));

export default function FeaturedPublicationsCarousel({ userId }: FeaturedPublicationsCarouselProps) {
  const t = useTranslations("perfil");
  const { canEditCards } = usePerspectivaInterna();
  const { publicacion: publicacionService } = useServices();
  const { mostrarConfirm, agregarNotificacion } = useUIStore();
  const { data, loading, error, refetch } = usePublicacionesDestacadas(userId);

  const featuredPosts = mapFeaturedPosts(data);

  const handleQuitarDestacado = useCallback((idPublicacion: number) => {
    mostrarConfirm({
      titulo: "Quitar destacado",
      mensaje: "¿Quieres quitar esta publicación de las destacadas?",
      onConfirm: async () => {
        try {
          await publicacionService.actualizarDestacadasUsuario(idPublicacion, false);
          agregarNotificacion({
            tipo: "success",
            mensaje: "La publicación ya no está destacada.",
          });
          await refetch();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "No fue posible actualizar el destacado.";
          agregarNotificacion({
            tipo: "error",
            mensaje: errorMessage,
          });
        }
      },
    });
  }, [agregarNotificacion, mostrarConfirm, publicacionService, refetch]);

  if (!userId) {
    return null;
  }

  return (
    <section className="perfil-page__section">
      <h2 className="perfil-page__section-title">{t("sections.featured")}</h2>

      {loading && <p className="perfil-page__coming-soon">Cargando publicaciones destacadas...</p>}

      {error && (
        <p className="perfil-page__coming-soon" style={{ color: "var(--swap-danger-color)" }}>
          {error}
        </p>
      )}

      {!loading && !error && featuredPosts.length === 0 && (
        <p className="perfil-page__coming-soon">Aún no hay publicaciones destacadas.</p>
      )}

      {!loading && !error && featuredPosts.length > 0 && (
        <HorizontalCarousel>
          {featuredPosts.map((pub) => (
            <div key={pub.id} className="h-carousel__item">
              <PostCard
                publicacionId={pub.id}
                tags={pub.tags}
                title={pub.title}
                price={pub.price}
                description={pub.description}
                images={pub.images}
                estado={pub.estado}
                categorias={pub.categorias}
                isDestacado={true}
                onToggleDestacado={canEditCards ? () => handleQuitarDestacado(pub.id) : undefined}
              />
            </div>
          ))}
        </HorizontalCarousel>
      )}
    </section>
  );
}
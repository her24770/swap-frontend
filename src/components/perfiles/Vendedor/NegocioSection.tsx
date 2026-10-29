import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import type { CatalogPost } from "./catalogoVendedor";
import { useCambiarEstadoPost } from "./useCambiarEstadoPost";
import CatalogoSection from "./CatalogoSection";

interface NegocioSectionProps {
  posts: CatalogPost[];
  setPosts: Dispatch<SetStateAction<CatalogPost[]>>;
  loading: boolean;
  error: string | null;
  soloLectura: boolean;
  canCreate: boolean;
  onCrear: () => void;
  onPinChange: (id: number, pinned: boolean) => void;
  onEditar: (pub: CatalogPost) => void;
  onEliminar: (id: number) => void;
  onDetalles: (pub: CatalogPost) => void;
}

// Catálogo de productos y negocios.
export default function NegocioSection({
  posts,
  setPosts,
  loading,
  error,
  soloLectura,
  canCreate,
  onCrear,
  onPinChange,
  onEditar,
  onEliminar,
  onDetalles,
}: NegocioSectionProps) {
  const t = useTranslations("perfil");
  const cambiarEstado = useCambiarEstadoPost(setPosts);

  return (
    <CatalogoSection
      title={t("sections.catalogNegocio")}
      createLabel={t("actions.newPostNegocio")}
      emptyMessage={t("sections.emptyCatalogNegocio")}
      canCreate={canCreate}
      onCreate={onCrear}
      loading={loading}
      error={error}
      posts={posts}
      renderCard={(pub) => (
        <PostCard
          soloLectura={soloLectura}
          publicacionId={pub.id}
          tags={pub.tags}
          title={pub.title}
          price={pub.price}
          description={pub.description}
          images={pub.images}
          estado={pub.estado}
          isPinned={pub.isPinned}
          onPinChange={(newPinned) => onPinChange(pub.id, newPinned)}
          onEditClick={() => onEditar(pub)}
          onDeleteClick={() => onEliminar(pub.id)}
          onEstadoChange={(nuevoEstado) => cambiarEstado(pub, nuevoEstado)}
          onDetallesClick={() => onDetalles(pub)}
        />
      )}
    />
  );
}

import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import type { CatalogPost } from "../Vendedor/catalogoVendedor";
import CatalogoSection from "../Vendedor/CatalogoSection";

interface TutoriasSectionProps {
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

// Catálogo de tutorías.
export default function TutoriasSection({
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
}: TutoriasSectionProps) {
  const t = useTranslations("perfil");

  return (
    <CatalogoSection
      title={t("sections.catalog")}
      createLabel={t("actions.newPostTutoria")}
      emptyMessage={t("sections.emptyCatalogTutoria")}
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
          onImageUpdate={(newUrl) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === pub.id ? { ...p, images: [newUrl, ...p.images.slice(1)] } : p
              )
            );
          }}
          onDetallesClick={() => onDetalles(pub)}
        />
      )}
    />
  );
}

import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useEstados } from "../../../hooks/useEstados";
import type { CatalogPost } from "./catalogoVendedor";
import CatalogoSection from "./CatalogoSection";

interface MaterialSectionProps {
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

// Catálogo de materiales.
export default function MaterialSection({
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
}: MaterialSectionProps) {
  const t = useTranslations("perfil");
  const estadosMaterial = useEstados("material");

  return (
    <CatalogoSection
      title={t("sections.catalogMaterial")}
      createLabel={t("actions.newPostMaterial")}
      emptyMessage="Aún no tienes publicaciones de materiales."
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
          estadosDisponibles={estadosMaterial}
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
          onEstadoChange={async (nuevoEstado) => {
            try {
              await apiClient.put(`/api/publicacion/${pub.id}`, { estado: nuevoEstado, etiquetas: [1] });
              setPosts((prev) =>
                prev.map((p) => p.id === pub.id ? { ...p, estado: nuevoEstado } : p)
              );
            } catch (err) {
              const apiError = err as ApiError;
              alert(apiError.message || "No fue posible cambiar el estado.");
            }
          }}
          onDetallesClick={() => onDetalles(pub)}
        />
      )}
    />
  );
}

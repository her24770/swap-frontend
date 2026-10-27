import type { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import PostCard from "../../posts/PostCard/PostCard";
import { apiClient, type ApiError } from "../../../lib/apiClient";
import { useUIStore } from "../../../store/uiStore";
import type { CatalogPost } from "./catalogoVendedor";
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
  const { agregarNotificacion } = useUIStore();

  return (
    <CatalogoSection
      title={t("sections.catalogNegocio")}
      createLabel={t("actions.newPostNegocio")}
      emptyMessage="Aún no tienes publicaciones de negocio."
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
          onEstadoChange={async (nuevoEstado) => {
            try {
              await apiClient.put(`/api/publicacion/${pub.id}`, { estado: nuevoEstado, etiquetas: [1] });
              setPosts((prev) =>
                prev.map((p) => p.id === pub.id ? { ...p, estado: nuevoEstado } : p)
              );
            } catch (err) {
              agregarNotificacion({
                tipo: "error",
                mensaje: (err as ApiError).message || "No fue posible cambiar el estado.",
              });
            }
          }}
          onDetallesClick={() => onDetalles(pub)}
        />
      )}
    />
  );
}

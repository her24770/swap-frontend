"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SquarePlus } from "lucide-react";
import UserProfileHeader from "../../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../../../components/posts/PostCard/PostCard";
import CommentSection from "../../../../components/users/UserCard/Comments/CommentSection";
import AdBanner from "../../../../components/perfiles/Vendedor/AdBanner/AdBanner";
import HorizontalCarousel from "../../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../../../components/ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import imagePath from "../../../../../public/images/uvg.jpg";
import { getPerfilPublico } from "../../../../services/perfilService";
import {
  PerspectivaInternaProvider,
  usePerspectivaInterna,
} from "../../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../../store/authStore";
import "../../../../components/ui/Button/Button.css";
import "../../../../components/ui/Modal/Modal.css";
import "./PerfilVendedorPage.css";

import type { Tag } from "../../../../types/tag";
import type { Comment } from "../../../../types/comment";
import type { UserProfileData } from "../../../../types/perfil";

const MOCK_CATALOG = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Porción pastel",
  price: 15,
  description: "Media porción de pastel de chocolate hecho en casa.",
  tags: [{ id: 3, name: "Negocio", parentId: null }] as Tag[],
  estado: i % 3 === 0 ? "vendido" : "activo",
}));

const MOCK_AD = {
  imageUrl: imagePath.src,
  title: "2x1 en porción de pasteles",
  subtitle: "¡Oferta por tiempo limitado!",
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    authorName: "Carlos M.",
    timeAgo: "Hace 2 días",
    rating: 5,
    comment: "Muy buen profesor, explica con mucha paciencia. Me ayudó a entender temas complejos de Álgebra que no entendía en clase.",
  },
  {
    id: "2",
    authorName: "Miguel R.",
    timeAgo: "Hace 1 semana",
    rating: 4,
    comment: "Puntual y organizado. 100% recomendado para cualquiera que busque regularizar sus créditos.",
  },
];

export default function PerfilVendedorPage() {
  const t = useTranslations("vendedor");
  const tCommon = useTranslations("common");

  const { id } = useParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.usuario?.id_usuario);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setUser(await getPerfilPublico(Number(id)));
      } catch (error) {
        console.error("Error cargando vendedor:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleCommentSubmit = (comment: string, rating: number, anonymous: boolean) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      authorName: anonymous ? tCommon("people.anonymous") : tCommon("people.you"),
      timeAgo: tCommon("time.justNow"),
      rating,
      comment,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  if (!user) return <p>{t("loading")}</p>;

  const isOwnProfile = Number(id) === currentUserId;

  return (
    <main className="perfil-vendedor">
      <PerspectivaInternaProvider isOwnProfile={isOwnProfile} activeProfileMode="vendedor">
        <UserProfileHeader
          user={user}
          onSave={async (updated) => {
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    name: updated.name ?? prev.name,
                    description: updated.description ?? prev.description,
                    imageUrl: updated.imageUrl ?? prev.imageUrl,
                    contacts: updated.contacts
                      ? updated.contacts.map((c: any) => ({
                          platform: c.tipo_contacto,
                          url: c.valor,
                        }))
                      : prev.contacts,
                  }
                : prev
            );
          }}
        />

        <hr className="perfil-vendedor__divider" />

        <section className="perfil-vendedor__section">
          <div className="perfil-vendedor__section-header">
            <h2 className="perfil-page__carousel-wrap">{t("sections.catalog")}</h2>
            <NuevaPublicacionButton
              label={t("actions.newPublication")}
              onClick={() => setModalOpen(true)}
            />
          </div>
          <div className="perfil-vendedor__carousel-wrap">
            <HorizontalCarousel>
              {MOCK_CATALOG.map((pub) => (
                <div key={pub.id} className="h-carousel__item">
                  <PostCard
                    tags={pub.tags}
                    title={pub.title}
                    price={pub.price}
                    description={pub.description}
                    images={[imagePath.src]}
                    estado={pub.estado}
                  />
                </div>
              ))}
            </HorizontalCarousel>
          </div>
        </section>

        <hr className="perfil-vendedor__divider" />

        <section className="perfil-vendedor__section">
          <h2 className="perfil-page__carousel-wrap">{t("sections.ads")}</h2>
          <AdBanner
            imageUrl={MOCK_AD.imageUrl}
            title={MOCK_AD.title}
            description={MOCK_AD.subtitle}
          />
        </section>

        <PerfilVendedorCommentsSection
          title={t("sections.comments")}
          targetName={user.name}
          comments={comments}
          onSubmit={handleCommentSubmit}
        />

        {isOwnProfile && modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="perfil-vendedor__form-modal" onClick={(e) => e.stopPropagation()}>
              <CrearPublicacionForm
                mode="crear"
                onSuccess={() => setModalOpen(false)}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        )}
      </PerspectivaInternaProvider>
    </main>
  );
}

interface NuevaPublicacionButtonProps {
  label: string;
  onClick: () => void;
}

function NuevaPublicacionButton({ label, onClick }: NuevaPublicacionButtonProps) {
  const { canCreatePublication } = usePerspectivaInterna();

  if (!canCreatePublication) return null;

  return (
    <button
      type="button"
      className="button button--small"
      onClick={onClick}
    >
      <SquarePlus size={14} />
      {label}
    </button>
  );
}

interface PerfilVendedorCommentsSectionProps {
  title: string;
  targetName: string;
  comments: Comment[];
  onSubmit: (comment: string, rating: number, anonymous: boolean) => void;
}

function PerfilVendedorCommentsSection({
  title,
  targetName,
  comments,
  onSubmit,
}: PerfilVendedorCommentsSectionProps) {
  const { canViewCommentsSection } = usePerspectivaInterna();

  if (!canViewCommentsSection) return null;

  return (
    <>
      <hr className="perfil-vendedor__divider" />

      <section className="perfil-vendedor__section">
        <h2 className="perfil-vendedor__section-title">{title}</h2>
        <div className="perfil-vendedor__comments">
          <CommentSection
            targetName={targetName}
            comments={comments}
            onSubmit={onSubmit}
            onCancel={() => {}}
          />
        </div>
      </section>
    </>
  );
}

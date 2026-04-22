"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SquarePlus } from "lucide-react";
import UserProfileHeader from "../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../../components/posts/PostCard/PostCard";
import CommentSection from "../../../components/users/UserCard/Comments/CommentSection";
import AdBanner from "../../../components/ui/AdBanner/AdBanner";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import CrearPublicacionForm from "../../../components/ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import imagePath from "../../../../public/images/uvg.jpg";
import { TAGS_MATERIAS } from "../../../lib/tags";
import { apiClient } from "../../../lib/apiClient";
import { obtenerContactosUsuario } from "../../../lib/contactosUsuario";
import "../../../components/ui/Button/Button.css";
import "../../../components/ui/Modal/Modal.css";
import "./PerfilVendedorPage.css";

import type { Tag } from "../../../types/tag";
import type { Comment } from "../../../types/comment";
import type { UserProfileData } from "../../../types/perfil";

const MOCK_CATALOG = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Porción pastel",
  price: 15,
  description: "Media porción de pastel de chocolate hecho en casa.",
  tags: [{ id: 3, name: "Negocio", colorKey: "diseno" }] as Tag[],
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
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const data = await apiClient.get<any>(`/api/user/${id}`);
        const contacts = await obtenerContactosUsuario(Number(id));
        setUser({
          id_usuario: data.id_usuario,
          name: data.nombre,
          description: data.descripcion,
          imageUrl: data.url_foto_perfil,
          rating: Number(data.calificacion),
          totalReviews: 0,
          paymentMethod: data.metodo_pago,
          contacts,
          tags: TAGS_MATERIAS,
        });
      } catch (error) {
        console.error("Error cargando vendedor:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleCommentSubmit = (comment: string, rating: number, anonymous: boolean) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      authorName: anonymous ? "Anónimo" : "Tú",
      timeAgo: "Ahora mismo",
      rating,
      comment,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <main className="perfil-vendedor">

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
          <h2 className="perfil-vendedor__section-title">Catálogo</h2>
          <button
            type="button"
            className="button button--small"
            onClick={() => setModalOpen(true)}
          >
            <SquarePlus size={14} />
            Nueva publicación
          </button>
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
                />
              </div>
            ))}
          </HorizontalCarousel>
        </div>
      </section>

      <hr className="perfil-vendedor__divider" />

      <section className="perfil-vendedor__section">
        <h2 className="perfil-vendedor__section-title">Anuncios</h2>
        <AdBanner
          imageUrl={MOCK_AD.imageUrl}
          title={MOCK_AD.title}
          subtitle={MOCK_AD.subtitle}
        />
      </section>

      <hr className="perfil-vendedor__divider" />

      <section className="perfil-vendedor__section">
        <h2 className="perfil-vendedor__section-title">Comentarios y Reseñas</h2>
        <div className="perfil-vendedor__comments">
          <CommentSection
            targetName={user.name}
            comments={comments}
            onSubmit={handleCommentSubmit}
            onCancel={() => {}}
          />
        </div>
      </section>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="perfil-vendedor__form-modal" onClick={(e) => e.stopPropagation()}>
            <CrearPublicacionForm
              onSuccess={() => setModalOpen(false)}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </div>
      )}

    </main>
  );
}

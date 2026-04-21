"use client";

import { useState } from "react";
import UserProfileHeader from "../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../../components/posts/PostCard/PostCard";
import CommentSection from "../../../components/users/UserCard/Comments/CommentSection";
import AdBanner from "../../../components/ui/AdBanner/AdBanner";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import imagePath from "../../../../public/images/uvg.jpg";
import { TAGS_MATERIAS } from "../../../lib/tags";
import "./PerfilVendedorPage.css";

import type { Tag } from "../../../types/tag";
import type { Comment } from "../../../types/comment";

const MOCK_SELLER = {
  id_usuario: 123,
  name: "Michael Perez",
  description:
    "Soy un estudiante de cuarto año de Ingeniería electrónica, me gusta mucho explicar sobre temas de matemática y electrónica.",
  imageUrl: undefined as string | undefined,
  rating: 2,
  totalReviews: 15,
  paymentMethod: "Transferencia",
  contacts: [
    { platform: "instagram" as const, url: "https://instagram.com" },
    { platform: "whatsapp" as const, url: "https://wa.me/12345678" },
  ],
};


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
    comment:
      "Muy buen profesor, explica con mucha paciencia. Me ayudó a entender temas complejos de Álgebra que no entendía en clase.",
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
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

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

  return (
    <main className="perfil-vendedor">

      <UserProfileHeader
        user={{
          id_usuario:   MOCK_SELLER.id_usuario,
          name:         MOCK_SELLER.name,
          description:  MOCK_SELLER.description,
          imageUrl:     MOCK_SELLER.imageUrl,
          rating:       MOCK_SELLER.rating,
          totalReviews: MOCK_SELLER.totalReviews,
          contacts:     MOCK_SELLER.contacts,
          paymentMethod: MOCK_SELLER.paymentMethod,
          tags: TAGS_MATERIAS,
        }}
        onSave={async (updated) => {
          console.log("Guardar perfil:", updated);
        }}
      />

      <hr className="perfil-vendedor__divider" />

      <section className="perfil-vendedor__section">
        <h2 className="perfil-vendedor__section-title">Catálogo</h2>
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
            targetName={MOCK_SELLER.name}
            comments={comments}
            onSubmit={handleCommentSubmit}
            onCancel={() => {}}
          />
        </div>
      </section>

    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import UserProfileHeader from "../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../components/posts/PostCard/PostCard";
import PostRes from "../../components/posts/PostResumida/PostRes";
import CommentSection from "../../components/users/UserCard/Comments/CommentSection";
import HorizontalCarousel from "../../components/ui/HorizontalCarousel/HorizontalCarousel";
import imagePath from "../../../public/images/uvg.jpg";
import "./PerfilConsumidorPage.css";

import type { Tag } from "../../types/tag";
import type { Comment } from "../../types/comment";

// ── Datos mock ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: "Michael Perez",
  description:
    "Soy un estudiante de cuarto año de Ingeniería electrónica, me gusta mucho explicar sobre temas de matemática y electrónica.",
  imageUrl: undefined as string | undefined,
  rating: 2,
  totalReviews: 12,
  contacts: [
    { platform: "instagram" as const, url: "https://instagram.com" },
    { platform: "whatsapp" as const, url: "https://wa.me/12345678" },
  ],
};

const MOCK_TAGS: Tag[] = [
  { id: 1, name: "Assembler", colorKey: "assembler" },
  { id: 2, name: "Comunicación", colorKey: "comunicacion" },
  { id: 3, name: "Electrónica", colorKey: "electronica" },
  { id: 4, name: "Física", colorKey: "fisica" },
  { id: 5, name: "Diseño", colorKey: "diseno" },
  { id: 6, name: "Biología", colorKey: "biologia" },
];

const MOCK_SAVED = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
  description:
    "Brinda tutorías para Assembler, específicamente para ayudar en las labs y explicar prácticas de electrónica.",
  tags: [
    { id: 1, name: "Assembler", type: "categoria" },
    { id: 2, name: "Electrónica", type: "categoria" },
  ],
}));

const MOCK_PURCHASES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
}));

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

// ── Componente ────────────────────────────────────────────────────────────────

export default function PerfilConsumidorPage() {
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
    <main className="perfil-consumidor">

      {/* ── Perfil header ──────────────────────────────────────────── */}
      <UserProfileHeader
        user={{
          name: MOCK_USER.name,
          description: MOCK_USER.description,
          imageUrl: MOCK_USER.imageUrl,
          rating: MOCK_USER.rating,
          totalReviews: MOCK_USER.totalReviews,
          contacts: MOCK_USER.contacts,
          tags: MOCK_TAGS,
        }}
        onSave={async (updated) => {
          console.log("Guardar perfil:", updated);
        }}
      />

      <hr className="perfil-consumidor__divider" />

      {/* ── Tus Guardados ─────────────────────────────────────────── */}
      <section className="perfil-consumidor__section">
        <h2 className="perfil-consumidor__section-title">Tus Guardados</h2>
        <div className="perfil-consumidor__carousel-wrap">
          <HorizontalCarousel>
            {MOCK_SAVED.map((pub) => (
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

      <hr className="perfil-consumidor__divider" />

      {/* ── Tus Compras ───────────────────────────────────────────── */}
      <section className="perfil-consumidor__section">
        <h2 className="perfil-consumidor__section-title">Tus Compras</h2>
        <div className="perfil-consumidor__purchases-grid">
          {MOCK_PURCHASES.map((pub) => (
            <PostRes
              key={pub.id}
              title={pub.title}
              price={pub.price}
              images={[imagePath.src]}
            />
          ))}
        </div>
      </section>

      <hr className="perfil-consumidor__divider" />

      {/* ── Comentarios y Reseñas ─────────────────────────────────── */}
      <section className="perfil-consumidor__section">
        <h2 className="perfil-consumidor__section-title">Comentarios y Reseñas</h2>
        <div className="perfil-consumidor__comments">
          <CommentSection
            targetName={MOCK_USER.name}
            comments={comments}
            onSubmit={handleCommentSubmit}
            onCancel={() => {}}
          />
        </div>
      </section>

    </main>
  );
}
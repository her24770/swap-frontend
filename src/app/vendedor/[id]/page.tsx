"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import UserProfileHeader from "../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../../components/posts/PostCard/PostCard";
import CommentSection from "../../../components/users/UserCard/Comments/CommentSection";
import AdBanner from "../../../components/ui/AdBanner/AdBanner";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import imagePath from "../../../../public/images/uvg.jpg";
import "./PerfilVendedorPage.css";

// ── Tipos mock ────────────────────────────────────────────────────────────────

interface Tag {
  id: number;
  name: string;
  colorKey: string;
}

interface Comment {
  id: string;
  authorName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

// ── Datos mock ────────────────────────────────────────────────────────────────

const MOCK_SELLER = {
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

const MOCK_TAGS: Tag[] = [
  { id: 1, name: "Assembler", colorKey: "assembler" },
  { id: 2, name: "Comunicación", colorKey: "comunicacion" },
  { id: 3, name: "Electrónica", colorKey: "electronica" },
  { id: 4, name: "Física", colorKey: "fisica" },
  { id: 5, name: "Diseño", colorKey: "diseno" },
  { id: 6, name: "Biología", colorKey: "biologia" },
];

const MOCK_CATALOG = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Porción pastel",
  price: 15,
  description: "Media porción de pastel de chocolate hecho en casa.",
  tags: [{ id: 1, name: "Negocio", type: "categoria" }],
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

// ── Componente ────────────────────────────────────────────────────────────────

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

      {/* ── Perfil header ──────────────────────────────────────────── */}
      <UserProfileHeader
        user={{
          name: MOCK_SELLER.name,
          description: MOCK_SELLER.description,
          imageUrl: MOCK_SELLER.imageUrl,
          rating: MOCK_SELLER.rating,
          totalReviews: MOCK_SELLER.totalReviews,
          contacts: MOCK_SELLER.contacts,
          paymentMethod: MOCK_SELLER.paymentMethod,
          tags: MOCK_TAGS,
        }}
        onSave={async (updated) => {
          console.log("Guardar perfil:", updated);
        }}
      />

      <hr className="perfil-vendedor__divider" />

      {/* ── Catálogo ───────────────────────────────────────────────── */}
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

      {/* ── Anuncios ───────────────────────────────────────────────── */}
      <section className="perfil-vendedor__section">
        <h2 className="perfil-vendedor__section-title">Anuncios</h2>
        <AdBanner
          imageUrl={MOCK_AD.imageUrl}
          title={MOCK_AD.title}
          subtitle={MOCK_AD.subtitle}
        />
      </section>

      <hr className="perfil-vendedor__divider" />

      {/* ── Comentarios y Reseñas ─────────────────────────────────── */}
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
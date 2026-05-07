"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "../../../lib/apiClient";
import { obtenerContactosUsuario } from "../../../lib/contactosUsuario";
import { useAuthStore } from "../../../store/authStore";
import { usePublicaciones } from "../../../hooks/fetch/usePublicaciones";
import UserProfileHeader from "../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import PostCard from "../../../components/posts/PostCard/PostCard";
import PostRes from "../../../components/posts/PostResumida/PostRes";
import CommentSection from "../../../components/users/UserCard/Comments/CommentSection";
import AdBanner from "../../../components/ui/AdBanner/AdBanner";
import HorizontalCarousel from "../../../components/ui/HorizontalCarousel/HorizontalCarousel";
import imagePath from "../../../../public/images/uvg.jpg";
import { TAGS_MATERIAS } from "../../../lib/tags";
import type { Tag } from "../../../types/tag";
import type { Comment } from "../../../types/comment";
import type { UserProfileData } from "../../../types/perfil";
import CrearPublicacionForm from "../../../components/ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import "../../../components/ui/Modal/Modal.css";
import { SquarePlus } from "lucide-react";
import "./PerfilConsumidorPage.css";

type PerfilMode = "consumidor" | "vendedor";

const MOCK_SAVED = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
  description: "Brinda tutorías para Assembler, específicamente para ayudar en las labs.",
  tags: [
    { id: 1, name: "Assembler", colorKey: "assembler" },
    { id: 3, name: "Electrónica", colorKey: "electronica" },
  ] as Tag[],
  estado: "activo",
}));

const MOCK_PURCHASES = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: "Assembler",
  price: 100,
}));

const MOCK_CATALOG = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "Porción pastel",
  price: 15,
  description: "Media porción de pastel de chocolate hecho en casa.",
  tags: [{ id: 3, name: "Negocio", colorKey: "diseno" }] as Tag[],
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
    comment: "Muy buen profesor, explica con mucha paciencia.",
  },
  {
    id: "2",
    authorName: "Miguel R.",
    timeAgo: "Hace 1 semana",
    rating: 4,
    comment: "Puntual y organizado. 100% recomendado.",
  },
];

export default function PerfilPage() {
  const t = useTranslations("perfil");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState<PerfilMode>("consumidor");
  const [crearPublicacionOpen, setCrearPublicacionOpen] = useState(false);
  const [editPublicacionOpen, setEditPublicacionOpen] = useState(false);
  const [publicacionEditando, setPublicacionEditando] = useState<(typeof MOCK_CATALOG)[0] | null>(null);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);

  useEffect(() => {
    if (!idUsuario) {
      setUser(null);
      return;
    }
    const fetchUser = async () => {
      try {
        const data = await apiClient.get<any>(`/api/user/${idUsuario}`);
        const contacts = await obtenerContactosUsuario(idUsuario);
        setUser({
          id_usuario: data.id_usuario,
          name: data.nombre,
          description: data.descripcion,
          imageUrl: data.url_foto_perfil,
          rating: Number(data.calificacion),
          totalReviews: 0,
          contacts,
        });
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    };
    fetchUser();
  }, [idUsuario]);

  useEffect(() => {
    if (mode !== "vendedor") setCrearPublicacionOpen(false);
  }, [mode]);

  const handleCommentSubmit = (comment: string, rating: number, anonymous: boolean) => {
    setComments((prev) => [
      {
        id: Date.now().toString(),
        authorName: anonymous ? tCommon("people.anonymous") : tCommon("people.you"),
        timeAgo: tCommon("time.justNow"),
        rating,
        comment,
      },
      ...prev,
    ]);
  };

  if (!user) return <p className="perfil-page__loading">{t("loading")}</p>;

  return (
    <main className="perfil-page">

      {/* ── Header compartido ── */}
      <UserProfileHeader
        user={{ ...user, tags: TAGS_MATERIAS }}
        onSave={async (updated) => {
          setUser((prev) =>
            prev ? {
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
            } : prev
          );
        }}
      />

      {/* ── Toggle de modo ── */}
      <div className="perfil-page__mode-toggle">
        <button
          type="button"
          className={`perfil-page__mode-btn${mode === "consumidor" ? " perfil-page__mode-btn--active" : ""}`}
          onClick={() => setMode("consumidor")}
        >
          {t("mode.consumer")}
        </button>
        <button
          type="button"
          className={`perfil-page__mode-btn${mode === "vendedor" ? " perfil-page__mode-btn--active" : ""}`}
          onClick={() => setMode("vendedor")}
        >
          {t("mode.seller")}
        </button>
      </div>

      <hr className="perfil-page__divider" />

      {/* ── Contenido según modo ── */}
      {mode === "consumidor" ? (

        <>
          <section className="perfil-page__section">
            <h2 className="perfil-page__carousel-wrap">{t("sections.saved")}</h2>
            <HorizontalCarousel>
              {MOCK_SAVED.map((pub) => (
                <div key={pub.id} className="h-carousel__item">
                  <PostCard
                    tags={pub.tags}
                    title={pub.title}
                    price={pub.price}
                    description={pub.description}
                    images={[imagePath.src]}
                    estado={pub.estado}
                    canEdit={false}
                  />
                </div>
              ))}
            </HorizontalCarousel>
          </section>

          <hr className="perfil-page__divider" />

          <section className="perfil-page__section">
            <h2 className="perfil-page__carousel-wrap">{t("sections.purchases")}</h2>
            <HorizontalCarousel>
              {MOCK_PURCHASES.map((pub) => (
                <div key={pub.id} className="perfil-page__purchase-item">
                  <PostRes
                    title={pub.title}
                    price={pub.price}
                    images={[imagePath.src]}
                  />
                </div>
              ))}
            </HorizontalCarousel>
          </section>
        </>

      ) : (

        <>
          <section className="perfil-page__section">
            <div className="perfil-page__catalog-bar">
              <h2 className="perfil-page__carousel-wrap">{t("sections.catalog")}</h2>
              <button
                type="button"
                className="perfil-page__new-publication-btn"
                onClick={() => setCrearPublicacionOpen(true)}
              >
                <SquarePlus size={18} strokeWidth={1.8} aria-hidden />
                {t("actions.newPublication")}
              </button>
            </div>
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
                    canEdit={true}
                    onEditClick={() => {
                      setPublicacionEditando(pub);
                      setEditPublicacionOpen(true);
                    }}
                    onEstadoChange={(nuevoEstado) => console.log(`Cambiar estado a: ${nuevoEstado}`)}
                  />
                </div>
              ))}
            </HorizontalCarousel>
          </section>

          <hr className="perfil-page__divider" />

          <section className="perfil-page__section">
            <div className="perfil-page__catalog-bar">
              <h2 className="perfil-page__carousel-wrap">{t("sections.ads")}</h2>
              <button
                type="button"
                className="perfil-page__new-publication-btn"
              >
                {t("actions.changeAd")}
              </button>
            </div>
            <AdBanner
              imageUrl={MOCK_AD.imageUrl}
              title={MOCK_AD.title}
              subtitle={MOCK_AD.subtitle}
            />
          </section>
        </>

      )}

      <hr className="perfil-page__divider" />

      {/* ── Comentarios — siempre visibles ── */}
      {crearPublicacionOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setCrearPublicacionOpen(false)}
        >
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.createPublicationAria")}
          >
            <CrearPublicacionForm
              mode="crear"
              onCancel={() => setCrearPublicacionOpen(false)}
              onSuccess={() => setCrearPublicacionOpen(false)}
            />
          </div>
        </div>
      )}

      {editPublicacionOpen && publicacionEditando && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setEditPublicacionOpen(false)}
        >
          <div
            className="perfil-page__crear-pub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("modal.editPublicationAria")}
          >
            <CrearPublicacionForm
              mode="editar"
              publicacionId={publicacionEditando.id}
              defaultValues={{
                titulo: publicacionEditando.title,
                descripcion: publicacionEditando.description,
                precio: String(publicacionEditando.price),
                tipo_publicacion: "material",
                categorias: publicacionEditando.tags.map((t) => t.id),
                destacado: false,
              }}
              estadoActual={publicacionEditando.estado as "disponible" | "vendido" | "reservado"}
              onCancel={() => {
                setEditPublicacionOpen(false);
                setPublicacionEditando(null);
              }}
              onSuccess={() => {
                setEditPublicacionOpen(false);
                setPublicacionEditando(null);
              }}
            />
          </div>
        </div>
      )}

      <section className="perfil-page__section">
        <h2 className="perfil-page__section-title">{t("sections.comments")}</h2>
        <CommentSection
          targetName={user.name}
          comments={comments}
          onSubmit={handleCommentSubmit}
          onCancel={() => {}}
        />
      </section>

    </main>
  );
}
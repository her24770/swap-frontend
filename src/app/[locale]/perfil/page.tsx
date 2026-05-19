"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "../../../lib/apiClient";
import { obtenerContactosUsuario } from "../../../lib/contactosUsuario";
import { useAuthStore } from "../../../store/authStore";
import UserProfileHeader from "../../../components/users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../../components/users/UserCard/Comments/CommentSection";
import VistaConsumidor from "../../../components/perfiles/Consumidor/vistaConsumidor";
import VistaVendedor from "../../../components/perfiles/Vendedor/vistaVendedor";
import VistaTutor from "../../../components/perfiles/Tutor/vistaTutor";
import { TAGS_MATERIAS } from "../../../lib/tags";
import { CanEditProvider } from "../../../context/CanEditContext";
import "./PerfilConsumidorPage.css";
import CrearPublicacionForm from "../../../components/ui/Modal/CrearPublicacionForm/CrearPublicacionForm";
import type { Comment } from "../../../types/comment";
import type { UserProfileData } from "../../../types/perfil";

type PublicacionEditando = {
  id: number;
  title: string;
  description: string;
  price: number;
  tags: { id: number }[];
  estado: string;
};

type PerfilMode = "consumidor" | "vendedor" | "tutor";

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
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [crearPublicacionOpen, setCrearPublicacionOpen] = useState(false);
  const [editPublicacionOpen, setEditPublicacionOpen] = useState(false);
  const [publicacionEditando, setPublicacionEditando] = useState<PublicacionEditando | null>(null);
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

  const MODES: { key: PerfilMode; label: string }[] = [
    { key: "consumidor", label: t("mode.consumer") },
    { key: "vendedor", label: t("mode.seller") },
    { key: "tutor", label: t("mode.tutor") },
  ];

  return (
    <main className="perfil-page">
      {/* ── Header compartido ── */}
      <UserProfileHeader
        user={{ ...user, tags: TAGS_MATERIAS }}
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

      {/* Seleccion de modos (consumidor, vendedor, tutor) */}
      <div className="perfil-page__mode-toggle">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`perfil-page__mode-btn${
              mode === key ? " perfil-page__mode-btn--active" : ""
            }`}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <hr className="perfil-page__divider" />

      <CanEditProvider canEdit={mode === "vendedor" || mode === "tutor"}>
        {mode === "consumidor" && <VistaConsumidor />}

        {mode === "vendedor" && <VistaVendedor />}

        {mode === "tutor" && <VistaTutor />}
      </CanEditProvider>

      <hr className="perfil-page__divider" />

      {/* Comentarios*/}
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

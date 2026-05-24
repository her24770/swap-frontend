"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../users/UserCard/Comments/CommentSection";
import VistaConsumidor from "../Consumidor/vistaConsumidor";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { apiClient } from "../../../lib/apiClient";
import { unwrapAuthResponse } from "../../../lib/authResponse";
import { getPerfilPublico } from "../../../services/perfilService";
import {
  PerspectivaInternaProvider,
  usePerspectivaInterna,
} from "../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../store/authStore";
import type { ApiResult } from "../../../types/ApiResult";
import type { AuthResponse } from "../../../types/usuario";
import type { Comment } from "../../../types/comment";
import type { UserProfileData } from "../../../types/perfil";

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

export default function PerfilInterno() {
  const t = useTranslations("perfil");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState<PerfilMode>("consumidor");
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idUsuario = useAuthStore((s) => s.usuario?.id_usuario);
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        let usuarioId = idUsuario;

        if (!usuarioId) {
          const sesionResponse = await apiClient.get<ApiResult<AuthResponse> | AuthResponse>(
            "/api/auth/me"
          );
          const sesion = unwrapAuthResponse(sesionResponse);
          login(sesion.usuario, sesion.rol);
          usuarioId = sesion.usuario.id_usuario;
        }

        setUser(await getPerfilPublico(usuarioId));
      } catch (err: any) {
        setError(err.message || "No fue posible cargar tu perfil.");
      }
    };

    fetchUser();
  }, [idUsuario, login]);

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

  if (error) return <p className="perfil-page__loading">{error}</p>;
  if (!user) return <p className="perfil-page__loading">{t("loading")}</p>;

  const MODES: { key: PerfilMode; label: string }[] = [
    { key: "consumidor", label: t("mode.consumer") },
    { key: "vendedor", label: t("mode.seller") },
    { key: "tutor", label: t("mode.tutor") },
  ];

  return (
    <PerspectivaInternaProvider
      isOwnProfile={true}
      profileView="interno"
      activeProfileMode={mode}
    >
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

      <PerfilModeToggle
        mode={mode}
        modes={MODES}
        onModeChange={setMode}
      />

      <hr className="perfil-page__divider" />

      {mode === "consumidor" && <VistaConsumidor />}
      {mode === "vendedor" && (
        <VistaVendedor
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}
      {mode === "tutor" && (
        <VistaTutor
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}

      <hr className="perfil-page__divider" />

      <PerfilCommentsSection
        title={t("sections.comments")}
        targetName={user.name}
        comments={comments}
        onSubmit={handleCommentSubmit}
      />
    </PerspectivaInternaProvider>
  );
}

interface PerfilModeToggleProps {
  mode: PerfilMode;
  modes: { key: PerfilMode; label: string }[];
  onModeChange: (mode: PerfilMode) => void;
}

function PerfilModeToggle({
  mode,
  modes,
  onModeChange,
}: PerfilModeToggleProps) {
  const { canViewConsumerSection } = usePerspectivaInterna();
  const visibleModes = canViewConsumerSection
    ? modes
    : modes.filter(({ key }) => key !== "consumidor");

  return (
    <div className="perfil-page__mode-toggle">
      {visibleModes.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`perfil-page__mode-btn${
            mode === key ? " perfil-page__mode-btn--active" : ""
          }`}
          onClick={() => onModeChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface PerfilCommentsSectionProps {
  title: string;
  targetName: string;
  comments: Comment[];
  onSubmit: (comment: string, rating: number, anonymous: boolean) => void;
}

function PerfilCommentsSection({
  title,
  targetName,
  comments,
  onSubmit,
}: PerfilCommentsSectionProps) {
  const { canViewCommentsSection } = usePerspectivaInterna();

  if (!canViewCommentsSection) return null;

  return (
    <section className="perfil-page__section">
      <h2 className="perfil-page__section-title">{title}</h2>
      <CommentSection
        targetName={targetName}
        comments={comments}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    </section>
  );
}

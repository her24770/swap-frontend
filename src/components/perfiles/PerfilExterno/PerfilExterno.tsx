"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import UserProfileHeader from "../../users/UserCard/UserProfileHeader/UserProfileHeader";
import CommentSection from "../../users/UserCard/Comments/CommentSection";
import VistaVendedor from "../Vendedor/vistaVendedor";
import VistaTutor from "../Tutor/vistaTutor";
import { apiClient } from "../../../lib/apiClient";
import { mapApiContactosToContacts } from "../../../lib/contactosUsuario";
import { TAGS_MATERIAS } from "../../../lib/tags";
import { PerspectivaInternaProvider } from "../../../context/PerspectivaInternaContext";
import { useAuthStore } from "../../../store/authStore";
import type { ApiResult } from "../../../types/ApiResult";
import type { Comment } from "../../../types/comment";
import type { UserProfileData } from "../../../types/perfil";

type PerfilExternoMode = "vendedor" | "tutor";

interface PerfilExternoProps {
  userId: number;
}

interface PerfilPublicoApi {
  id_usuario: number;
  nombre: string;
  descripcion: string | null;
  url_foto_perfil?: string;
  calificacion: number | string | null;
  metodo_pago?: string;
  contactos?: unknown[];
}

export default function PerfilExterno({ userId }: PerfilExternoProps) {
  const t = useTranslations("perfil");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("modo") === "tutor" ? "tutor" : "vendedor";
  const authUserName = useAuthStore((s) => s.usuario?.nombre);

  const [mode, setMode] = useState<PerfilExternoMode>(initialMode);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentsByMode, setCommentsByMode] = useState<Record<PerfilExternoMode, Comment[]>>({
    vendedor: [],
    tutor: [],
  });

  const modes = useMemo(
    () => [
      { key: "vendedor" as const, label: t("mode.seller") },
      { key: "tutor" as const, label: t("mode.tutor") },
    ],
    [t]
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setError(null);
        const response = await apiClient.get<ApiResult<PerfilPublicoApi> | PerfilPublicoApi>(
          `/api/user/${userId}/perfil-publico`
        );
        const data = unwrapPerfilPublico(response);
        setUser({
          id_usuario: data.id_usuario,
          name: data.nombre,
          description: data.descripcion,
          imageUrl: data.url_foto_perfil,
          rating: Number(data.calificacion),
          totalReviews: 0,
          contacts: mapApiContactosToContacts(data.contactos ?? []),
          paymentMethod: data.metodo_pago,
          tags: TAGS_MATERIAS,
        });
      } catch (err: any) {
        setError(err.message || "No fue posible cargar el perfil.");
      }
    };

    fetchUser();
  }, [userId]);

  const handleCommentSubmit = (comment: string, rating: number, anonymous: boolean) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      authorName: anonymous ? tCommon("people.anonymous") : authUserName ?? tCommon("people.you"),
      timeAgo: tCommon("time.justNow"),
      rating,
      comment,
    };

    setCommentsByMode((prev) => ({
      ...prev,
      [mode]: [newComment, ...prev[mode]],
    }));
  };

  if (error) {
    return <p className="perfil-page__loading">{error}</p>;
  }

  if (!user) {
    return <p className="perfil-page__loading">{t("loading")}</p>;
  }

  return (
    <PerspectivaInternaProvider
      isOwnProfile={false}
      profileView="externo"
      activeProfileMode={mode}
    >
      <UserProfileHeader user={user} />

      <div className="perfil-page__mode-toggle">
        {modes.map(({ key, label }) => (
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

      {mode === "vendedor" && (
        <VistaVendedor
          userId={userId}
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}
      {mode === "tutor" && (
        <VistaTutor
          userId={userId}
          userName={user.name}
          userRating={user.rating}
          userImageUrl={user.imageUrl}
        />
      )}

      <hr className="perfil-page__divider" />

      <section className="perfil-page__section">
        <h2 className="perfil-page__section-title">{t("sections.comments")}</h2>
        <CommentSection
          targetName={user.name}
          comments={commentsByMode[mode]}
          onSubmit={handleCommentSubmit}
          onCancel={() => {}}
        />
      </section>
    </PerspectivaInternaProvider>
  );
}

function unwrapPerfilPublico(
  response: ApiResult<PerfilPublicoApi> | PerfilPublicoApi
): PerfilPublicoApi {
  if (response && typeof response === "object" && "success" in response) {
    const data = (response as ApiResult<PerfilPublicoApi>).data;
    if (!data) {
      throw new Error("No fue posible cargar el perfil.");
    }
    return data;
  }

  return response as PerfilPublicoApi;
}
